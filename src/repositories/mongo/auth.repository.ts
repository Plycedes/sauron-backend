import { UserModel } from "../../models/mongo";
import { CreateUserInput, IAuthRepository } from "../interface/IAuthRepository";
import { UserRole, UserStatus } from "../../types/user.types";

export class MongoAuthRepository implements IAuthRepository {
    async create(user: CreateUserInput & { passwordHash: string }): Promise<{ id: string }> {
        const doc = await UserModel.create({
            userId: user.userId,
            fullName: user.fullName,
            email: user.email.toLowerCase(),
            passwordHash: user.passwordHash,
        });
        return { id: doc._id.toString() };
    }

    async findByUserId(userId: string): Promise<{
        _id: string;
        userId: string;
        passwordHash: string;
        role: UserRole;
        status: UserStatus;
    } | null> {
        const doc = await UserModel.findOne({ userId }).lean();
        if (!doc) return null;
        return {
            _id: doc._id.toString(),
            userId: doc.userId,
            passwordHash: doc.passwordHash,
            role: doc.role,
            status: doc.status,
        };
    }

    async findByEmail(email: string): Promise<{
        _id: string;
        email: string;
        userId: string;
    } | null> {
        const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
        if (!doc) return null;
        return {
            _id: doc._id.toString(),
            email: doc.email,
            userId: doc.userId,
        };
    }

    async updateLastLogin(id: string): Promise<void> {
        await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
    }

    async storeRefreshToken(id: string, refreshToken: string): Promise<void> {
        await UserModel.findByIdAndUpdate(id, {
            $addToSet: { refreshTokens: refreshToken },
        });
    }

    async revokeRefreshToken(id: string, refreshToken: string): Promise<void> {
        await UserModel.findByIdAndUpdate(id, {
            $pull: { refreshTokens: refreshToken },
        });
    }

    async revokeAllRefreshTokens(id: string): Promise<number> {
        const doc = await UserModel.findByIdAndUpdate(
            id,
            { $set: { refreshTokens: [] } },
            { returnDocument: 'after' }
        );
        return doc?.refreshTokens.length ?? 0;
    }
}
