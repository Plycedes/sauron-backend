import { projectRepository, membershipRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { ProjectInput, ProjectMember, ProjectResponse, ProjectWithMembers } from '../types/project.types';

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
): Promise<ProjectWithMembers[]> {
  const membership = await membershipRepository.findByUserAndCompany(requestingUserId, companyId);
  if (!membership) {
    throw new ApiError(403, 'You do not belong to this company');
  }

  const [projects, companyMemberships] = await Promise.all([
    projectRepository.findByCompany(companyId),
    membershipRepository.findAllByCompany(companyId),
  ]);

  const membershipMap = new Map(companyMemberships.map((m) => [m.userId, m]));

  const enrich = (raw: ProjectResponse[]): ProjectWithMembers[] =>
    raw.map(({ memberIds, ...rest }) => ({
      ...rest,
      members: memberIds
        .map((id): ProjectMember | null => {
          const m = membershipMap.get(id);
          return m ? { _id: m.userId, fullName: m.name ?? 'Unknown', role: m.role } : null;
        })
        .filter((m): m is ProjectMember => m !== null),
    }));

  if (membership.role === 'member') {
    return enrich(projects.filter((p) => p.memberIds.includes(requestingUserId)));
  }

  return enrich(projects);
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
