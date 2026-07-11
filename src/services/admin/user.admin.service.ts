import mongoose from 'mongoose';
import { UserModel, MembershipModel } from '../../models/mongo';
import { ApiError } from '../../utils';

function assertValidObjectId(id: string, label = 'User ID'): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

export async function listUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.search) {
    const regex = new RegExp(params.search, 'i');
    filter.$or = [{ fullName: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select('-passwordHash -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUserById(userId: string) {
  assertValidObjectId(userId);

  const user = await UserModel.findById(userId).select('-passwordHash -refreshTokens').lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const memberships = await MembershipModel.find({ userId: user._id })
    .populate('companyId', 'name domain')
    .lean();

  return { ...user, memberships };
}

export async function updateUserStatus(userId: string, status: string) {
  assertValidObjectId(userId);

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { status } },
    { new: true },
  ).select('-passwordHash -refreshTokens');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
}

export async function updateUserRole(userId: string, role: string) {
  assertValidObjectId(userId);

  const user = await UserModel.findByIdAndUpdate(userId, { $set: { role } }, { new: true }).select(
    '-passwordHash -refreshTokens',
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
}

export async function deleteUser(userId: string) {
  assertValidObjectId(userId);

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  await UserModel.findByIdAndDelete(userId);
  await MembershipModel.deleteMany({ userId: user._id });
}
