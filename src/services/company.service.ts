import { companyRepository, membershipRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { CompanyInput, CompanyResponse } from '../types/company.types';

export async function createCompany(
  adminId: string,
  input: CompanyInput,
): Promise<CompanyResponse> {
  const existing = await companyRepository.findByDomain(input.domain);
  if (existing) {
    throw new ApiError(409, 'Company domain already taken');
  }

  const company = await companyRepository.create({ ...input, adminId });

  await membershipRepository.create({
    userId: adminId,
    companyId: company._id,
    role: 'company_admin',
  });

  return company;
}

export async function getCompany(companyId: string): Promise<CompanyResponse> {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  return company;
}
