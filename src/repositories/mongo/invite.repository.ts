import { InviteModel } from "../../models/mongo";
import { IInviteRepository } from "../interface/IInviteRepository";
import { InviteInput, InviteResponse, InviteStatus } from "../../types/invite.types";

type LeanInviteDoc = {
    _id: { toString(): string };
    email: string;
    companyId: { toString(): string };
    role: string;
    status: InviteStatus;
    token: string;
    expiresAt: Date;
};

export class MongoInviteRepository implements IInviteRepository {
    private toResponse(doc: LeanInviteDoc): InviteResponse {
        return {
            _id: doc._id.toString(),
            email: doc.email,
            companyId: doc.companyId.toString(),
            role: doc.role,
            status: doc.status,
            token: doc.token,
            expiresAt: doc.expiresAt,
        };
    }

    async findByToken(token: string): Promise<InviteResponse | null> {
        const doc = await InviteModel.findOne({ token }).lean();
        if (!doc) return null;
        return this.toResponse(doc as unknown as LeanInviteDoc);
    }

    async findByEmail(email: string, companyId: string): Promise<InviteResponse | null> {
        const doc = await InviteModel.findOne({
            email: email.toLowerCase(),
            companyId,
        }).lean();
        if (!doc) return null;
        return this.toResponse(doc as unknown as LeanInviteDoc);
    }

    async findPendingByEmail(email: string): Promise<InviteResponse[]> {
        const docs = await InviteModel.find({
            email: email.toLowerCase(),
            status: 'pending',
        }).lean();
        return docs.map((doc) => this.toResponse(doc as unknown as LeanInviteDoc));
    }

    async create(data: InviteInput & { token: string; expiresAt: Date }): Promise<InviteResponse> {
        const doc = await InviteModel.create({
            ...data,
            email: data.email.toLowerCase(),
        });
        return this.toResponse(doc.toObject() as unknown as LeanInviteDoc);
    }

    async updateStatus(id: string, status: InviteStatus): Promise<void> {
        await InviteModel.findByIdAndUpdate(id, { status });
    }
}
