import { ProjectModel } from "../../models/mongo";
import { IProjectRepository } from "../interface/IProjectRepository";
import { ProjectInput, ProjectResponse, ProjectStatus } from "../../types/project.types";

type LeanProjectDoc = {
    _id: { toString(): string };
    name: string;
    description: string;
    companyId: { toString(): string };
    createdBy: { toString(): string };
    memberIds: { toString(): string }[];
    status: ProjectStatus;
    createdAt: Date;
};

export class MongoProjectRepository implements IProjectRepository {
    private toResponse(doc: LeanProjectDoc): ProjectResponse {
        return {
            _id: doc._id.toString(),
            name: doc.name,
            description: doc.description,
            companyId: doc.companyId.toString(),
            createdBy: doc.createdBy.toString(),
            memberIds: doc.memberIds.map((id) => id.toString()),
            status: doc.status,
            createdAt: doc.createdAt,
        };
    }

    async findById(id: string): Promise<ProjectResponse | null> {
        const doc = await ProjectModel.findById(id).lean();
        if (!doc) return null;
        return this.toResponse(doc as unknown as LeanProjectDoc);
    }

    async findByCompany(companyId: string): Promise<ProjectResponse[]> {
        const docs = await ProjectModel.find({ companyId }).lean();
        return docs.map((doc) => this.toResponse(doc as unknown as LeanProjectDoc));
    }

    async create(data: ProjectInput & { createdBy: string }): Promise<ProjectResponse> {
        const doc = await ProjectModel.create(data);
        return this.toResponse(doc.toObject() as unknown as LeanProjectDoc);
    }

    async addMember(projectId: string, userId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, {
            $addToSet: { memberIds: userId },
        });
    }

    async removeMember(projectId: string, userId: string): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, {
            $pull: { memberIds: userId },
        });
    }

    async updateStatus(projectId: string, status: ProjectStatus): Promise<void> {
        await ProjectModel.findByIdAndUpdate(projectId, { status });
    }
}
