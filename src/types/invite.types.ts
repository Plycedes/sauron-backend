export type InviteStatus = 'pending' | 'accepted' | 'expired';
export type InviteRole = 'pm' | 'member';

export interface InviteInput {
  email: string;
  companyId: string;
  role: InviteRole;
}

export interface InviteResponse {
  _id: string;
  email: string;
  companyId: string;
  companyName?: string;
  role: string;
  status: InviteStatus;
  token: string;
  expiresAt: Date;
}
