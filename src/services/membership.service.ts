import { membershipRepository, companyRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { MembershipRole, MembershipResponse } from '../types/membership.types';
import { CompanyWithRole } from '../types/company.types';

export async function getUserCompanies(userId: string): Promise<CompanyWithRole[]> {
  const memberships = await membershipRepository.findAllByUser(userId);
  if (memberships.length === 0) return [];

  const companies = await companyRepository.findManyByIds(memberships.map((m) => m.companyId));

  return companies.map((company) => {
    const membership = memberships.find((m) => m.companyId === company._id)!;
    return { ...company, role: membership.role };
  });
}

export async function getCompanyMembers(companyId: string): Promise<MembershipResponse[]> {
  return membershipRepository.findAllByCompany(companyId);
}

export async function updateMemberRole(
  companyId: string,
  targetUserId: string,
  requestingUserId: string,
  role: MembershipRole,
): Promise<MembershipResponse> {
  if (targetUserId === requestingUserId) {
    throw new ApiError(400, 'Cannot change your own role');
  }

  const updated = await membershipRepository.updateRole(targetUserId, companyId, role);
  if (!updated) {
    throw new ApiError(404, 'Membership not found');
  }

  return updated;
}

export async function removeMember(
  companyId: string,
  targetUserId: string,
  requestingUserId: string,
): Promise<void> {
  if (targetUserId === requestingUserId) {
    throw new ApiError(400, 'Cannot remove yourself from the company');
  }

  const membership = await membershipRepository.findByUserAndCompany(targetUserId, companyId);
  if (!membership) {
    throw new ApiError(404, 'Membership not found');
  }

  await membershipRepository.delete(targetUserId, companyId);
}
