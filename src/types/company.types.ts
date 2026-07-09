import { MembershipRole } from './membership.types';

export interface CompanyInput {
  name: string;
  domain: string;
}

export interface CompanyResponse {
  _id: string;
  name: string;
  domain: string;
  adminId: string;
  createdAt: Date;
}

export interface CompanyWithRole extends CompanyResponse {
  role: MembershipRole;
}
