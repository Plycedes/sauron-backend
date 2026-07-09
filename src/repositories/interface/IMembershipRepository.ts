import { MembershipInput, MembershipResponse, MembershipRole } from '../../types/membership.types';

export interface IMembershipRepository {
  create(data: MembershipInput): Promise<MembershipResponse>;
  findByUserAndCompany(userId: string, companyId: string): Promise<MembershipResponse | null>;
  findAllByCompany(companyId: string): Promise<MembershipResponse[]>;
  findAllByUser(userId: string): Promise<MembershipResponse[]>;
  updateRole(
    userId: string,
    companyId: string,
    role: MembershipRole,
  ): Promise<MembershipResponse | null>;
  delete(userId: string, companyId: string): Promise<void>;
}
