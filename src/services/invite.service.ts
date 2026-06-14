import crypto from "crypto";
import { inviteRepository } from "../repositories";
import { UserModel } from "../models/mongo";
import { ApiError } from "../utils/ApiError";
import { InviteInput, InviteResponse } from "../types/invite.types";

export async function sendInvite(input: InviteInput, requestingUserId: string): Promise<InviteResponse> {
    const requester = await UserModel.findById(requestingUserId).lean();
    if (!requester) {
        throw new ApiError(404, "Requesting user not found");
    }

    if (requester.role !== "company_admin") {
        throw new ApiError(403, "Only company admins can send invites");
    }

    const existing = await inviteRepository.findByEmail(input.email, input.companyId);
    if (existing && existing.status === "pending") {
        throw new ApiError(409, "A pending invite already exists for this email and company");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const invite = await inviteRepository.create({ ...input, token, expiresAt });

    // TODO: send invite email with token link via mailer microservice

    return invite;
}

export async function acceptInvite(token: string, userId: string): Promise<void> {
    const invite = await inviteRepository.findByToken(token);
    if (!invite) {
        throw new ApiError(404, "Invite not found");
    }

    if (invite.status !== "pending" || invite.expiresAt.getTime() <= Date.now()) {
        throw new ApiError(400, "Invite is expired or already used");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.companyId = invite.companyId as any;
    user.role = invite.role as any;
    await user.save();

    await inviteRepository.updateStatus(invite._id, "accepted");
}
