import bcrypt from "bcrypt";
import { authRepository, userRepository } from "../repositories";
import {
    CreateUserInput,
    LoginUserInput,
    AuthResponse,
    RefreshResponse,
    LogoutResponse,
    UserProfile,
} from "../types/user.types";
import { ApiError, jwt } from "../utils";

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "1d";

export async function register(input: CreateUserInput): Promise<AuthResponse> {
    const existingEmail = await authRepository.findByEmail(input.email);
    if (existingEmail) {
        throw new ApiError(400, "Email already registered");
    }

    const existingUserId = await authRepository.findByUserId(input.userId);
    if (existingUserId) {
        throw new ApiError(400, "User ID already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const { id } = await authRepository.create({
        ...input,
        passwordHash,
    });

    const profile = await userRepository.findById(id);
    if (!profile) {
        throw new ApiError(500, "Failed to load newly created user");
    }

    const token = generateAccessToken(profile);
    const expiresAt = getTokenExpiry(ACCESS_TOKEN_EXPIRY);

    return {
        user: profile,
        token,
        expiresAt,
    };
}

export async function login(input: LoginUserInput): Promise<AuthResponse> {
    const user = await authRepository.findByUserId(input.userId);
    if (!user) {
        throw new ApiError(401, "Invalid user ID or password");
    }

    if (user.status === "suspended") {
        throw new ApiError(403, "Account suspended");
    }

    if (user.status === "pending") {
        throw new ApiError(401, "Account pending approval");
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
        throw new ApiError(401, "Invalid user ID or password");
    }

    const profile = await userRepository.findById(user._id);
    if (!profile) {
        throw new ApiError(401, "Invalid user ID or password");
    }

    const refreshToken = jwt.generateRefreshToken({ userId: user._id, role: user.role });
    await authRepository.storeRefreshToken(user._id, refreshToken);
    await authRepository.updateLastLogin(user._id);

    const token = generateAccessToken(profile);
    const expiresAt = getTokenExpiry(ACCESS_TOKEN_EXPIRY);

    return {
        user: profile,
        token,
        expiresAt,
    };
}

export async function logout(userId: string, refreshToken?: string, allDevices?: boolean): Promise<LogoutResponse> {
    if (allDevices) {
        const count = await authRepository.revokeAllRefreshTokens(userId);
        return { sessionsRevoked: count };
    }

    if (refreshToken) {
        await authRepository.revokeRefreshToken(userId, refreshToken);
    }

    return {};
}

export async function getProfile(userId: string): Promise<UserProfile> {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
}

export async function refreshToken(userId: string): Promise<RefreshResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new ApiError(401, "Token expired or invalid");
    }

    if (user.status === "suspended") {
        throw new ApiError(403, "Account suspended");
    }

    const token = generateAccessToken(user);
    const expiresAt = getTokenExpiry(ACCESS_TOKEN_EXPIRY);

    return { token, expiresAt };
}

function generateAccessToken(profile: UserProfile): string {
    return jwt.generateToken({
        userId: profile.id,
        role: profile.role,
    });
}

function getTokenExpiry(expiry: string): string {
    const match = expiry.match(/^(\d+)([smhd])$/);
    const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    if (!match) return new Date(Date.now() + 3600000).toISOString();
    const value = parseInt(match[1], 10);
    return new Date(Date.now() + value * multipliers[match[2]]).toISOString();
}
