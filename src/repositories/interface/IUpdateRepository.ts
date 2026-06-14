import { UpdateInput, UpdateResponse } from "../../types/update.types";

export interface IUpdateRepository {
    create(data: UpdateInput & { userId: string; companyId: string; embeddingId?: string }): Promise<UpdateResponse>;
    findByProject(projectId: string, from?: Date, to?: Date): Promise<UpdateResponse[]>;
    findByUser(userId: string, projectId?: string, from?: Date, to?: Date): Promise<UpdateResponse[]>;
    findById(id: string): Promise<UpdateResponse | null>;
    setEmbeddingId(updateId: string, embeddingId: string): Promise<void>;
}
