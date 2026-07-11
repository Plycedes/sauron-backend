import mongoose from 'mongoose';
import {
  CompanyModel,
  MembershipModel,
  ProjectModel,
  InviteModel,
  DailyUpdateModel,
  EmbeddingModel,
} from '../../models/mongo';
import { ApiError } from '../../utils';

function assertValidObjectId(id: string, label = 'Company ID'): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

export async function listCompanies(params: { page?: number; limit?: number; search?: string }) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (params.search) {
    const regex = new RegExp(params.search, 'i');
    filter.$or = [{ name: regex }, { domain: regex }];
  }

  const [companies, total] = await Promise.all([
    CompanyModel.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'memberships',
          localField: '_id',
          foreignField: 'companyId',
          as: '_members',
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'companyId',
          as: '_projects',
        },
      },
      {
        $addFields: {
          memberCount: { $size: '$_members' },
          projectCount: { $size: '$_projects' },
        },
      },
      { $project: { _members: 0, _projects: 0 } },
    ]),
    CompanyModel.countDocuments(filter),
  ]);

  return { companies, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getCompanyById(companyId: string) {
  assertValidObjectId(companyId);

  const [company, members, projects, pendingInviteCount] = await Promise.all([
    CompanyModel.findById(companyId).populate('adminId', 'fullName email').lean(),
    MembershipModel.find({ companyId }).populate('userId', 'fullName email avatar').lean(),
    ProjectModel.find({ companyId }).lean(),
    InviteModel.countDocuments({ companyId, status: 'pending' }),
  ]);

  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  return { ...company, members, projects, pendingInviteCount };
}

export async function deleteCompany(companyId: string) {
  assertValidObjectId(companyId);

  const company = await CompanyModel.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  await Promise.all([
    DailyUpdateModel.deleteMany({ companyId: company._id }),
    EmbeddingModel.deleteMany({ companyId: company._id }),
    InviteModel.deleteMany({ companyId: company._id }),
    ProjectModel.deleteMany({ companyId: company._id }),
    MembershipModel.deleteMany({ companyId: company._id }),
  ]);

  await CompanyModel.findByIdAndDelete(companyId);
}
