import { projectRepository } from "../repositories";
import { UserModel } from "../models/mongo";
import { ApiError } from "../utils/ApiError";
import { ProjectInput, ProjectResponse } from "../types/project.types";

export async function createProject(input: ProjectInput, requestingUserId: string): Promise<ProjectResponse> {
	const requester = await UserModel.findById(requestingUserId).lean();
	if (!requester) {
		throw new ApiError(404, "Requesting user not found");
	}

	if (requester.role !== "pm" && requester.role !== "company_admin") {
		throw new ApiError(403, "Only PMs or company admins can create projects");
	}

	if (!requester.companyId || requester.companyId.toString() !== input.companyId) {
		throw new ApiError(403, "You can only create projects in your own company");
	}

	return projectRepository.create({ ...input, createdBy: requestingUserId });
}

export async function getProjectsByCompany(companyId: string, requestingUserId: string): Promise<ProjectResponse[]> {
	const requester = await UserModel.findById(requestingUserId).lean();
	if (!requester) {
		throw new ApiError(404, "Requesting user not found");
	}

	if (!requester.companyId || requester.companyId.toString() !== companyId) {
		throw new ApiError(403, "You do not belong to this company");
	}

	const projects = await projectRepository.findByCompany(companyId);
	console.log(projects);

	if (requester.role === "member") {
		return projects.filter((p) => p.memberIds.includes(requestingUserId));
	}

	return projects;
}

export async function assignMember(projectId: string, targetUserId: string, requestingUserId: string): Promise<void> {
	await assertProjectManager(projectId, requestingUserId);

	const project = await projectRepository.findById(projectId);
	if (!project) {
		throw new ApiError(404, "Project not found");
	}

	const target = await UserModel.findById(targetUserId).lean();
	if (!target) {
		throw new ApiError(404, "Target user not found");
	}

	if (!target.companyId || target.companyId.toString() !== project.companyId) {
		throw new ApiError(403, "Target user does not belong to this project’s company");
	}

	await projectRepository.addMember(projectId, targetUserId);
}

export async function removeMember(projectId: string, targetUserId: string, requestingUserId: string): Promise<void> {
	await assertProjectManager(projectId, requestingUserId);

	const project = await projectRepository.findById(projectId);
	if (!project) {
		throw new ApiError(404, "Project not found");
	}

	const target = await UserModel.findById(targetUserId).lean();
	if (!target) {
		throw new ApiError(404, "Target user not found");
	}

	if (!target.companyId || target.companyId.toString() !== project.companyId) {
		throw new ApiError(403, "Target user does not belong to this project’s company");
	}

	await projectRepository.removeMember(projectId, targetUserId);
}

async function assertProjectManager(projectId: string, requestingUserId: string): Promise<void> {
	const requester = await UserModel.findById(requestingUserId).lean();
	if (!requester) {
		throw new ApiError(404, "Requesting user not found");
	}

	if (requester.role !== "pm" && requester.role !== "company_admin") {
		throw new ApiError(403, "Only PMs or company admins can manage project members");
	}

	const project = await projectRepository.findById(projectId);
	if (!project) {
		throw new ApiError(404, "Project not found");
	}

	if (!requester.companyId || requester.companyId.toString() !== project.companyId) {
		throw new ApiError(403, "You can only manage projects in your own company");
	}
}
