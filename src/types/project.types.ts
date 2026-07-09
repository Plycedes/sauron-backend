import { MembershipRole } from './membership.types';

export type ProjectStatus = "active" | "on_hold" | "completed" | "archived";

export interface ProjectMember {
    _id: string;
    fullName: string;
    role: MembershipRole;
}

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

export type ProjectWithMembers = Omit<ProjectResponse, 'memberIds'> & {
    members: ProjectMember[];
};
