import { DailyUpdateModel } from "../../models/mongo";
import { IUpdateRepository } from "../interface/IUpdateRepository";
import { UpdateInput, UpdateResponse } from "../../types/update.types";

type LeanUpdateDoc = {
    _id: { toString(): string };
    userId: { toString(): string };
    projectId: { toString(): string };
    companyId: { toString(): string };
    date: Date;
    completed: string;
    nextSteps: string;
    blockers: string;
    category: string;
    hoursSpent: number;
    confidence: string;
    embeddingId?: string;
    createdAt: Date;
    updatedAt: Date;
};

export class MongoUpdateRepository implements IUpdateRepository {
    private toResponse(doc: LeanUpdateDoc): UpdateResponse {
        return {
            _id: doc._id.toString(),
            userId: doc.userId.toString(),
            projectId: doc.projectId.toString(),
            companyId: doc.companyId.toString(),
            date: doc.date,
            completed: doc.completed,
            nextSteps: doc.nextSteps,
            blockers: doc.blockers,
            category: doc.category as any,
            hoursSpent: doc.hoursSpent,
            confidence: doc.confidence as any,
            embeddingId: doc.embeddingId,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }

    async create(data: UpdateInput & { userId: string; companyId: string; embeddingId?: string }): Promise<UpdateResponse> {
        const doc = await DailyUpdateModel.create(data);
        return this.toResponse(doc.toObject() as unknown as LeanUpdateDoc);
    }

    async findByProject(projectId: string, from?: Date, to?: Date): Promise<UpdateResponse[]> {
        const filter: Record<string, unknown> = { projectId };
        if (from || to) {
            const dateFilter: Record<string, Date> = {};
            if (from) dateFilter.$gte = from;
            if (to) dateFilter.$lte = to;
            filter.date = dateFilter;
        }

        const docs = await DailyUpdateModel.find(filter).lean();
        return docs.map((doc) => this.toResponse(doc as unknown as LeanUpdateDoc));
    }

    async findByUser(userId: string, projectId?: string, from?: Date, to?: Date): Promise<UpdateResponse[]> {
        const filter: Record<string, unknown> = { userId };
        if (projectId) filter.projectId = projectId;
        if (from || to) {
            const dateFilter: Record<string, Date> = {};
            if (from) dateFilter.$gte = from;
            if (to) dateFilter.$lte = to;
            filter.date = dateFilter;
        }

        const docs = await DailyUpdateModel.find(filter).lean();
        return docs.map((doc) => this.toResponse(doc as unknown as LeanUpdateDoc));
    }

    async findById(id: string): Promise<UpdateResponse | null> {
        const doc = await DailyUpdateModel.findById(id).lean();
        if (!doc) return null;
        return this.toResponse(doc as unknown as LeanUpdateDoc);
    }

    async setEmbeddingId(updateId: string, embeddingId: string): Promise<void> {
        await DailyUpdateModel.findByIdAndUpdate(updateId, { embeddingId });
    }
}
