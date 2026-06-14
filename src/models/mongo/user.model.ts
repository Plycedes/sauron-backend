import mongoose, { Schema, Document } from "mongoose";
import { UserRole, UserStatus } from "../../types/user.types";

export interface IUserDocument extends Document {
    userId: string;
    fullName: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    companyId?: mongoose.Types.ObjectId;
    avatar?: string;
    status: UserStatus;
    refreshTokens: string[];
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
    {
        userId: { type: String, required: true, unique: true, trim: true },
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ["super_admin", "company_admin", "pm", "member"],
            default: "member",
        },
        companyId: { type: Schema.Types.ObjectId, ref: "Company" },
        avatar: { type: String },
        status: {
            type: String,
            enum: ["active", "pending", "suspended"],
            default: "active",
        },
        refreshTokens: { type: [String], default: [] },
        lastLoginAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);
