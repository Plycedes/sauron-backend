import mongoose, { Schema, Document } from "mongoose";
import { InviteRole, InviteStatus } from "../../types/invite.types";

export interface IInviteDocument extends Document {
    email: string;
    companyId: mongoose.Types.ObjectId;
    role: InviteRole;
    status: InviteStatus;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const InviteSchema = new Schema<IInviteDocument>(
    {
        email: { type: String, required: true, lowercase: true, trim: true },
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
        role: {
            type: String,
            enum: ["pm", "member"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "expired"],
            default: "pending",
        },
        token: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true },
);

export const InviteModel = mongoose.model<IInviteDocument>("Invite", InviteSchema);
