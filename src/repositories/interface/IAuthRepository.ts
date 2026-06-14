import { CreateUserInput, UserRole, UserStatus } from "../../types/user.types";

export type { CreateUserInput };

export interface IAuthRepository {
    create(user: CreateUserInput & { passwordHash: string }): Promise<{ id: string }>;
    findByUserId(userId: string): Promise<{
        _id: string;
        userId: string;
        passwordHash: string;
        role: UserRole;
        status: UserStatus;
    } | null>;
    findByEmail(email: string): Promise<{
        _id: string;
        email: string;
        userId: string;
    } | null>;
    updateLastLogin(id: string): Promise<void>;
    storeRefreshToken(id: string, refreshToken: string): Promise<void>;
    revokeRefreshToken(id: string, refreshToken: string): Promise<void>;
    revokeAllRefreshTokens(id: string): Promise<number>;
}
