# CLAUDE.md

Starter template — Express + Mongoose + JWT + Cloudinary. Layered architecture, pluggable microservices.

## Common Commands

```bash
npm run dev      # nodemon + ts-node (auto-reload, src/index.ts)
npm run build    # tsc → dist/
npm start        # node dist/index.js
```

> No `test` or `lint` script is configured in `package.json` — do not invent commands that don't exist. If you need tests, add a runner (e.g. `vitest`, `jest`) and wire its script before running it.

## Entry Point

`src/index.ts` boots the app: loads `config/env` (Joi-validated at import time), connects MongoDB, then starts Express. It also wires **graceful shutdown** (`SIGTERM` / `SIGINT` → close HTTP server → close Mongoose, 10s forced exit) and `unhandledRejection` / `uncaughtException` handlers (non-prod rejections exit; prod only logs).

`src/app.ts` mounts: `cors()` → `express.json()` → `GET /health` → `/api/v1` (from `src/routes/index.ts`) → `errorHandler` (last). Importing `./models/mongo` from `app.ts` triggers model registration via Mongoose side-effects.

## Architecture

```
Request Flow:
routes → controllers → services → repositories → MongoDB

Microservices (pluggable):
IMicroservice interface → concrete implementation (e.g. CloudinaryService)
  └── Imported as singleton from src/microservices/index.ts
```

### Key Directories

- `src/routes/` — Express routers mounted at `/api/v1`
- `src/controllers/` — Request handlers (auth, user, ...)
- `src/services/` — Business logic
- `src/repositories/` — Data access layer with interface/implementation pattern
- `src/models/mongo/` — Mongoose schemas
- `src/middlewares/` — Auth (JWT), validation, error handling, multer, jsonify
- `src/validators/` — Zod schemas for request validation
- `src/utils/` — ApiError, asyncHandler, responseHandler, jwt, rateLimit, filehandler
- `src/microservices/` — Pluggable provider abstractions (currently: storage)
- `src/config/` — env (Joi-validated) + db (mongoose connect)

### API Routes

- `POST /api/v1/auth/register` — Register user
- `POST /api/v1/auth/login` — Login (returns JWT)
- `POST /api/v1/auth/logout` — Logout (auth required)
- `GET  /api/v1/auth/me` — Get current user profile (auth required)
- `POST /api/v1/auth/refresh` — Refresh JWT (auth required)
- `GET  /api/v1/users/:id` — Fetch a user by ID (auth required)
- `PATCH /api/v1/users/:id` — Update user (auth required)
- `DELETE /api/v1/users/:id` — Delete user (auth required)

### Auth Flow

1. `register` or `login` → bcrypt-hashed password compared in `authService` → JWT issued
2. Access tokens: 1d expiry. Refresh tokens: 7d expiry (rotated per-session, stored in `refreshTokens[]`)
3. `authenticate` middleware decodes `Authorization: Bearer <token>` → `req.userId`

### User Model (src/models/mongo/user.model.ts)

Fields: `userId` (unique, login id), `fullName`, `email` (unique), `passwordHash`, `role` (`"user"|"admin"`), `avatar?`, `status` (`"active"|"pending"|"suspended"`), `refreshTokens[]`, `lastLoginAt`, timestamps.

### Environment Variables

Required in `.env` (see `.env.example`):

- `PORT` — server port (default: 5000)
- `NODE_ENV` — `development` / `production`
- `CORS` — CORS origin (default: `*`)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — secret for JWT signing
- `JWT_EXPIRES_IN` — refresh token expiry (default: `7d`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — for the storage microservice

### Storage Microservice

**Interface:** `src/microservices/storage/IStorageService.ts`
```typescript
interface IStorageService {
    upload(buffer: Buffer, filename: string, mimetype: string, folder?: string): Promise<StorageUploadResult>;
    delete(fileId: string): Promise<void>;
}
```

**Implementation:** `src/microservices/storage/cloudinary.service.ts` — uses `cloudinary.uploader.upload_stream` with `resource_type: "raw"`.

**Export:** `src/microservices/storage/index.ts` exports `storageService` singleton.

**To switch providers:** Replace the instance in `index.ts`. The interface is designed for S3-compatible swaps.

## Adding a New Resource

Follow this exact order. Each step builds on the previous one.

1. **Types** — `src/types/<resource>.types.ts`: input, response, and any enums. Re-export from `src/types/index.ts`.
2. **Model** — `src/models/mongo/<resource>.model.ts`: Mongoose schema + `I<Resource>Document` interface. Add export to `src/models/mongo/index.ts`.
3. **Repository interface** — `src/repositories/interface/I<Resource>Repository.ts`.
4. **Repository implementation** — `src/repositories/mongo/<resource>.repository.ts`. Register singleton in `src/repositories/index.ts`.
5. **Service** — `src/services/<resource>.service.ts`. Add `export * as <resource>Service` to `src/services/index.ts`.
6. **Validator** — `src/validators/<resource>.validator.ts` (Zod). Re-export from `src/validators/index.ts`.
7. **Controller** — `src/controllers/<resource>.controller.ts`. Use `asyncHandler` and `sendResponse`. Add `export * as <resource>Controller` to `src/controllers/index.ts`.
8. **Route** — `src/routes/<resource>.route.ts`. Mount in `src/routes/index.ts` under the resource path.

## Adding a New Microservice

1. Create folder: `src/microservices/<service>/`
2. Define `I<Service>Service.ts` interface
3. Implement `<Provider>Service.ts` against that interface
4. Create `src/microservices/<service>/index.ts` that exports a singleton instance
5. Re-export from `src/microservices/index.ts` (or mount with new property)

## Conventions

- **Errors** — throw `ApiError(statusCode, message, errors?)` from services. The central `errorHandler` middleware converts everything else.
- **Async handlers** — wrap every controller with `asyncHandler(...)`.
- **Response shape** — use `sendResponse(res, status, data, message)`. Never `res.json(...)` directly. (The `/health` endpoint in `app.ts` is the one exception — it uses `res.json` directly.)
- **Barrel files** — `index.ts` files use `export * from` (re-export) and `export * as <name>` (namespace) consistently. Match existing style.
- **Validate first** — `validate(Schema.action)` runs before controller. Schema object can have `body`, `query`, `params` Zod schemas.
- **Mongoose lean reads** — use `.lean()` for read-only queries to skip Mongoose document overhead.
- **Timestamps** — every model schema uses `{ timestamps: true }` for `createdAt`/`updatedAt`.
- **Imports** — use **relative paths** (`./services/...`, `../config/env`). `tsconfig.json` has no `paths` aliases, so `@/...` imports will not resolve.
- **Config access** — import `env` from `src/config/env` and use the camelCase keys (`env.jwtSecret`, `env.mongodbURI`, etc.). Do not read `process.env` elsewhere.
