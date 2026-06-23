import bcrypt from "bcrypt";
import env from "../config/env";
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

	return issueAndStoreTokens(profile);
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

	await authRepository.updateLastLogin(user._id);

	return issueAndStoreTokens(profile);
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

export async function refreshToken(rawRefreshToken: string): Promise<RefreshResponse> {
	let decoded;
	try {
		decoded = jwt.verifyRefreshToken(rawRefreshToken);
	} catch {
		throw new ApiError(401, "Invalid or expired refresh token");
	}

	const userId = decoded.userId;
	const profile = await userRepository.findById(userId);
	if (!profile) {
		throw new ApiError(401, "Token expired or invalid");
	}

	if (profile.status === "suspended") {
		throw new ApiError(403, "Account suspended");
	}

	const isStillValid = await authRepository.hasRefreshToken(userId, rawRefreshToken);
	if (!isStillValid) {
		// Reuse of an already-rotated/revoked refresh token: treat as theft.
		await authRepository.revokeAllRefreshTokens(userId);
		throw new ApiError(401, "Refresh token reuse detected — all sessions revoked");
	}

	await authRepository.revokeRefreshToken(userId, rawRefreshToken);

	const accessToken = jwt.generateAccessToken({ userId: profile.id, role: profile.role });
	const newRefreshToken = jwt.generateRefreshToken({ userId: profile.id, role: profile.role });
	await authRepository.storeRefreshToken(profile.id, newRefreshToken);

	return buildTokenBundle(accessToken, newRefreshToken);
}

async function issueAndStoreTokens(profile: UserProfile): Promise<AuthResponse> {
	const payload = { userId: profile.id, role: profile.role };

	const accessToken = jwt.generateAccessToken(payload);
	const refreshToken = jwt.generateRefreshToken(payload);

	await authRepository.storeRefreshToken(profile.id, refreshToken);

	const base = buildTokenBundle(accessToken, refreshToken);

	return {
		user: profile,
		...base,
	};
}

function buildTokenBundle(accessToken: string, refreshToken: string): Omit<AuthResponse, "user"> {
	return {
		accessToken,
		refreshToken,
		accessTokenExpiresAt: getTokenExpiry(env.jwtAccessExpiresIn),
		refreshTokenExpiresAt: getTokenExpiry(env.jwtRefreshExpiresIn),
	};
}

function getTokenExpiry(expiry: string): string {
	const match = expiry.match(/^(\d+)([smhd])$/);
	const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
	if (!match) return new Date(Date.now() + 3600000).toISOString();
	const value = parseInt(match[1], 10);
	return new Date(Date.now() + value * multipliers[match[2]]).toISOString();
}
