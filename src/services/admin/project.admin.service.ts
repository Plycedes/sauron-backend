import mongoose from 'mongoose';
import { ProjectModel, DailyUpdateModel, EmbeddingModel } from '../../models/mongo';
import { ApiError } from '../../utils';

function assertValidObjectId(id: string, label = 'Project ID'): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

export async function listProjects(params: {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  status?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (params.search) {
    filter.name = new RegExp(params.search, 'i');
  }

  if (params.companyId && mongoose.Types.ObjectId.isValid(params.companyId)) {
    filter.companyId = new mongoose.Types.ObjectId(params.companyId);
  }

  if (params.status) {
    filter.status = params.status;
  }

  const [projects, total] = await Promise.all([
    ProjectModel.find(filter)
      .populate('companyId', 'name domain')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ProjectModel.countDocuments(filter),
  ]);

  return { projects, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProjectById(projectId: string) {
  assertValidObjectId(projectId);

  const [project, updateCount] = await Promise.all([
    ProjectModel.findById(projectId)
      .populate('companyId', 'name domain')
      .populate('createdBy', 'fullName email')
      .populate('memberIds', 'fullName email avatar')
      .lean(),
    DailyUpdateModel.countDocuments({ projectId: new mongoose.Types.ObjectId(projectId) }),
  ]);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return { ...project, updateCount };
}

export async function updateProjectStatus(projectId: string, status: string) {
  assertValidObjectId(projectId);

  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    { $set: { status } },
    { new: true },
  )
    .populate('companyId', 'name domain')
    .populate('createdBy', 'fullName email');

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return project;
}

export async function deleteProject(projectId: string) {
  assertValidObjectId(projectId);

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  await Promise.all([
    DailyUpdateModel.deleteMany({ projectId: project._id }),
    EmbeddingModel.deleteMany({ projectId: project._id }),
  ]);

  await ProjectModel.findByIdAndDelete(projectId);
}
