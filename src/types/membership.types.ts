export type MembershipRole = 'company_admin' | 'pm' | 'member';

export interface MembershipInput {
  userId: string;
  companyId: string;
  role: MembershipRole;
}

export interface MembershipResponse {
  _id: string;
  userId: string;
  companyId: string;
  role: MembershipRole;
  joinedAt: Date;
  name?: string;
}
