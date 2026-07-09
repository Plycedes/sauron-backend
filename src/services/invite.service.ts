import crypto from 'crypto';
import {
  companyRepository,
  inviteRepository,
  membershipRepository,
  userRepository,
} from '../repositories';
import { ApiError } from '../utils/ApiError';
import { InviteInput, InviteResponse } from '../types/invite.types';
import { MembershipRole } from '../types/membership.types';

export async function sendInvite(
  input: InviteInput,
  requestingUserId: string,
): Promise<InviteResponse> {
  const membership = await membershipRepository.findByUserAndCompany(
    requestingUserId,
    input.companyId,
  );
  if (!membership || membership.role !== 'company_admin') {
    throw new ApiError(403, 'Only company admins can send invites');
  }

  const existing = await inviteRepository.findByEmail(input.email, input.companyId);
  if (existing && existing.status === 'pending') {
    throw new ApiError(409, 'A pending invite already exists for this email and company');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const invite = await inviteRepository.create({ ...input, token, expiresAt });

  // TODO: send invite email with token link via mailer microservice

  return invite;
}

export async function getPendingInvites(userId: string): Promise<InviteResponse[]> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const invites = await inviteRepository.findPendingByEmail(user.email);

  return Promise.all(
    invites.map(async (invite) => {
      const company = await companyRepository.findById(invite.companyId);
      return { ...invite, companyName: company?.name };
    }),
  );
}

export async function acceptInvite(token: string, userId: string): Promise<void> {
  const invite = await inviteRepository.findByToken(token);
  if (!invite) {
    throw new ApiError(404, 'Invite not found');
  }

  if (invite.status !== 'pending' || invite.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(400, 'Invite is expired or already used');
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const existingMembership = await membershipRepository.findByUserAndCompany(
    userId,
    invite.companyId,
  );
  if (existingMembership) {
    throw new ApiError(409, 'You are already a member of this company');
  }

  await membershipRepository.create({
    userId,
    companyId: invite.companyId,
    role: invite.role as MembershipRole,
  });

  await inviteRepository.updateStatus(invite._id, 'accepted');
}
