export type UserRole = "user" | "admin";
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
    refreshToken?: string;
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
    token: string;
    expiresAt: string;
}

export interface RefreshResponse {
    token: string;
    expiresAt: string;
}

export interface LogoutResponse {
    sessionsRevoked?: number;
}
