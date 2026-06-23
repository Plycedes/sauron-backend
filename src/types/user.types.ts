export type UserRole = "super_admin" | "company_admin" | "pm" | "member";
export type UserStatus = "active" | "pending" | "suspended";

export interface UserProfile {
	id: string;
	userId: string;
	fullName: string;
	email: string;
	role: UserRole;
	avatar?: string;
	status: UserStatus;
	createdAt: string;
	lastLoginAt: string;
	companyId?: string;
}

export interface CreateUserInput {
	fullName: string;
	userId: string;
	email: string;
	password: string;
}

export interface LoginUserInput {
	userId: string;
	password: string;
}

export interface RefreshTokenInput {
	refreshToken: string;
}

export interface LogoutInput {
	allDevices?: boolean;
}

export interface UpdateUserInput {
	fullName?: string;
	avatar?: string;
}

export interface AuthResponse {
	user: UserProfile;
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresAt: string;
	refreshTokenExpiresAt: string;
}

export interface RefreshResponse {
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresAt: string;
	refreshTokenExpiresAt: string;
}

export interface LogoutResponse {
	sessionsRevoked?: number;
}
