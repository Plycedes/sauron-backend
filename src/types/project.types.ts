export type ProjectStatus = "active" | "on_hold" | "completed" | "archived";

export interface ProjectInput {
    name: string;
    description: string;
    companyId: string;
}

export interface ProjectResponse {
    _id: string;
    name: string;
    description: string;
    companyId: string;
    createdBy: string;
    memberIds: string[];
    status: ProjectStatus;
    createdAt: Date;
}
