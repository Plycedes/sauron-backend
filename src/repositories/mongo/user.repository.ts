import { UserModel } from "../../models/mongo";
import { IUserRepository } from "../interface/IUserRepository";
import { UpdateUserInput, UserProfile, UserRole, UserStatus } from "../../types/user.types";
import { Types } from "mongoose";

type LeanUserDoc = {
	_id: { toString(): string };
	userId: string;
	fullName: string;
	email: string;
	role: UserRole;
	avatar?: string;
	status: UserStatus;
	createdAt: Date;
	lastLoginAt: Date;
	companyId?: Types.ObjectId;
};

export class MongoUserRepository implements IUserRepository {
	private toProfile(doc: LeanUserDoc): UserProfile {
		return {
			id: doc._id.toString(),
			userId: doc.userId,
			fullName: doc.fullName,
			email: doc.email,
			role: doc.role,
			avatar: doc.avatar,
			status: doc.status,
			createdAt: doc.createdAt.toISOString(),
			lastLoginAt: doc.lastLoginAt.toISOString(),
			companyId: doc.companyId?.toString(),
		};
	}

	async findById(id: string): Promise<UserProfile | null> {
		const doc = await UserModel.findById(id).lean();
		if (!doc) return null;
		return this.toProfile(doc);
	}

	async updateById(id: string, data: UpdateUserInput): Promise<UserProfile | null> {
		const doc = await UserModel.findByIdAndUpdate(id, data, { returnDocument: "after" }).lean();
		if (!doc) return null;
		return this.toProfile(doc);
	}

	async deleteById(id: string): Promise<void> {
		await UserModel.findByIdAndDelete(id);
	}
}
