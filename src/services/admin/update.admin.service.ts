import mongoose from 'mongoose';
import { DailyUpdateModel, EmbeddingModel } from '../../models/mongo';
import { ApiError } from '../../utils';

function assertValidObjectId(id: string, label = 'Update ID'): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

function toObjectId(id: string): mongoose.Types.ObjectId | undefined {
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : undefined;
}

export async function listUpdates(params: {
  page?: number;
  limit?: number;
  companyId?: string;
  projectId?: string;
  userId?: string;
  category?: string;
  confidence?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (params.companyId) {
    const id = toObjectId(params.companyId);
    if (id) filter.companyId = id;
  }

  if (params.projectId) {
    const id = toObjectId(params.projectId);
    if (id) filter.projectId = id;
  }

  if (params.userId) {
    const id = toObjectId(params.userId);
    if (id) filter.userId = id;
  }

  if (params.category) {
    filter.category = params.category;
  }

  if (params.confidence) {
    filter.confidence = params.confidence;
  }

  if (params.dateFrom || params.dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (params.dateFrom) dateFilter.$gte = new Date(params.dateFrom);
    if (params.dateTo) dateFilter.$lte = new Date(params.dateTo);
    filter.date = dateFilter;
  }

  const [updates, total] = await Promise.all([
    DailyUpdateModel.find(filter)
      .populate('userId', 'fullName email')
      .populate('projectId', 'name')
      .populate('companyId', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    DailyUpdateModel.countDocuments(filter),
  ]);

  return { updates, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUpdateById(updateId: string) {
  assertValidObjectId(updateId);

  const update = await DailyUpdateModel.findById(updateId)
    .populate('userId', 'fullName email')
    .populate('projectId', 'name')
    .populate('companyId', 'name')
    .lean();

  if (!update) {
    throw new ApiError(404, 'Update not found');
  }

  return update;
}

export async function deleteUpdate(updateId: string) {
  assertValidObjectId(updateId);

  const update = await DailyUpdateModel.findById(updateId);
  if (!update) {
    throw new ApiError(404, 'Update not found');
  }

  await Promise.all([
    DailyUpdateModel.findByIdAndDelete(updateId),
    EmbeddingModel.deleteOne({ updateId: update._id }),
  ]);
}
