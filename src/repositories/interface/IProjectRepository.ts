import { ProjectInput, ProjectResponse, ProjectStatus } from "../../types/project.types";

export interface IProjectRepository {
    findById(id: string): Promise<ProjectResponse | null>;
    findByCompany(companyId: string): Promise<ProjectResponse[]>;
    create(data: ProjectInput & { createdBy: string }): Promise<ProjectResponse>;
    addMember(projectId: string, userId: string): Promise<void>;
    removeMember(projectId: string, userId: string): Promise<void>;
    updateStatus(projectId: string, status: ProjectStatus): Promise<void>;
}
