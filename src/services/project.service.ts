import { projectRepository, membershipRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { ProjectInput, ProjectResponse } from '../types/project.types';

export async function createProject(
  input: ProjectInput,
  requestingUserId: string,
): Promise<ProjectResponse> {
  const membership = await membershipRepository.findByUserAndCompany(
    requestingUserId,
    input.companyId,
  );
  if (!membership || (membership.role !== 'pm' && membership.role !== 'company_admin')) {
    throw new ApiError(403, 'Only PMs or company admins can create projects');
  }

  return projectRepository.create({ ...input, createdBy: requestingUserId });
}

export async function getProjectsByCompany(
  companyId: string,
  requestingUserId: string,
): Promise<ProjectResponse[]> {
  const membership = await membershipRepository.findByUserAndCompany(requestingUserId, companyId);
  if (!membership) {
    throw new ApiError(403, 'You do not belong to this company');
  }

  const projects = await projectRepository.findByCompany(companyId);
  console.log(projects);

  if (membership.role === 'member') {
    return projects.filter((p) => p.memberIds.includes(requestingUserId));
  }

  return projects;
}

export async function assignMember(
  projectId: string,
  targetUserId: string,
  requestingUserId: string,
): Promise<void> {
  const project = await assertProjectManager(projectId, requestingUserId);

  const targetMembership = await membershipRepository.findByUserAndCompany(
    targetUserId,
    project.companyId,
  );
  if (!targetMembership) {
    throw new ApiError(403, "Target user does not belong to this project's company");
  }

  await projectRepository.addMember(projectId, targetUserId);
}

export async function removeMember(
  projectId: string,
  targetUserId: string,
  requestingUserId: string,
): Promise<void> {
  const project = await assertProjectManager(projectId, requestingUserId);

  const targetMembership = await membershipRepository.findByUserAndCompany(
    targetUserId,
    project.companyId,
  );
  if (!targetMembership) {
    throw new ApiError(403, "Target user does not belong to this project's company");
  }

  await projectRepository.removeMember(projectId, targetUserId);
}

async function assertProjectManager(
  projectId: string,
  requestingUserId: string,
): Promise<ProjectResponse> {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const membership = await membershipRepository.findByUserAndCompany(
    requestingUserId,
    project.companyId,
  );
  if (!membership || (membership.role !== 'pm' && membership.role !== 'company_admin')) {
    throw new ApiError(403, 'Only PMs or company admins can manage project members');
  }

  return project;
}
