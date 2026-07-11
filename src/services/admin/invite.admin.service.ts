import mongoose from 'mongoose';
import { InviteModel } from '../../models/mongo';
import { ApiError } from '../../utils';

function assertValidObjectId(id: string, label = 'Invite ID'): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

export async function listInvites(params: {
  page?: number;
  limit?: number;
  status?: string;
  companyId?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.companyId && mongoose.Types.ObjectId.isValid(params.companyId)) {
    filter.companyId = new mongoose.Types.ObjectId(params.companyId);
  }

  const [rawInvites, total] = await Promise.all([
    InviteModel.find(filter)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    InviteModel.countDocuments(filter),
  ]);

  const invites = rawInvites.map((inv) => ({ ...inv, token: inv.token.slice(-8) }));

  return { invites, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function deleteInvite(inviteId: string) {
  assertValidObjectId(inviteId);

  const invite = await InviteModel.findById(inviteId);
  if (!invite) {
    throw new ApiError(404, 'Invite not found');
  }

  await InviteModel.findByIdAndDelete(inviteId);
}
