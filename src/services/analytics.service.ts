import mongoose from 'mongoose';
import { membershipRepository } from '../repositories';
import { DailyUpdateModel, ProjectModel } from '../models/mongo';
import { ApiError } from '../utils/ApiError';
import { UpdateConfidence, UpdateCategory } from '../types/update.types';
import {
  ProjectStatsResponse,
  UserStatsResponse,
  ConfidenceTrendResponse,
  StaleMemberResponse,
  ConfidenceBreakdown,
  CategoryBreakdown,
  ZERO_CATEGORY_BREAKDOWN,
} from '../types/analytics.types';
import { MembershipResponse } from '../types/membership.types';

const CONFIDENCE_VALUE: Record<UpdateConfidence, number> = { low: 1, medium: 2, high: 3 };

function confidenceCounts(values: UpdateConfidence[]): ConfidenceBreakdown {
  const result: ConfidenceBreakdown = { low: 0, medium: 0, high: 0 };
  for (const v of values) result[v] += 1;
  return result;
}

function categoryCounts(values: UpdateCategory[]): CategoryBreakdown {
  const result: CategoryBreakdown = { ...ZERO_CATEGORY_BREAKDOWN };
  for (const v of values) result[v] += 1;
  return result;
}

function avgConfidence(values: UpdateConfidence[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + CONFIDENCE_VALUE[v], 0);
  return Math.round((sum / values.length) * 100) / 100;
}

async function assertCompanyAccess(
  companyId: string,
  requestingUserId: string,
): Promise<MembershipResponse> {
  const membership = await membershipRepository.findByUserAndCompany(requestingUserId, companyId);
  if (!membership) {
    throw new ApiError(403, 'You do not belong to this company');
  }
  return membership;
}

function computeStreak(dates: Date[]): number {
  const uniqueDays = [...new Set(dates.map((d) => new Date(d).toISOString().split('T')[0]))]
    .sort()
    .reverse();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let streak = 0;
  let check = new Date(today);

  for (const day of uniqueDays) {
    const expected = check.toISOString().split('T')[0];
    if (day === expected) {
      streak++;
      check.setUTCDate(check.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function getProjectStats(
  projectId: string,
  requestingUserId: string,
): Promise<ProjectStatsResponse> {
  const project = await ProjectModel.findById(projectId).lean();
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  await assertCompanyAccess(project.companyId.toString(), requestingUserId);

  if (!project.memberIds.some((id) => id.toString() === requestingUserId)) {
    throw new ApiError(403, 'You are not a member of this project');
  }

  const [memberStats, overall] = await Promise.all([
    DailyUpdateModel.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: {
          _id: '$userId',
          totalHours: { $sum: '$hoursSpent' },
          updateCount: { $sum: 1 },
          confidences: { $push: '$confidence' },
        },
      },
    ]),
    DailyUpdateModel.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hoursSpent' },
          totalUpdates: { $sum: 1 },
          categories: { $push: '$category' },
          minDate: { $min: '$date' },
          maxDate: { $max: '$date' },
        },
      },
    ]),
  ]);

  const members = memberStats.map((m) => ({
    userId: m._id.toString(),
    totalHours: m.totalHours,
    updateCount: m.updateCount,
    confidenceBreakdown: confidenceCounts(m.confidences),
  }));

  const overallData = overall[0];
  return {
    projectId,
    companyId: project.companyId.toString(),
    totalHours: overallData?.totalHours ?? 0,
    totalUpdates: overallData?.totalUpdates ?? 0,
    categoryBreakdown: overallData
      ? categoryCounts(overallData.categories)
      : { ...ZERO_CATEGORY_BREAKDOWN },
    dateRange: {
      from: overallData?.minDate ?? null,
      to: overallData?.maxDate ?? null,
    },
    members,
  };
}

export async function getUserStats(
  targetUserId: string,
  requestingUserId: string,
  projectId?: string,
): Promise<UserStatsResponse> {
  const isSelf = targetUserId === requestingUserId;

  const [requesterMemberships, targetMemberships] = await Promise.all([
    membershipRepository.findAllByUser(requestingUserId),
    membershipRepository.findAllByUser(targetUserId),
  ]);

  if (targetMemberships.length === 0) {
    throw new ApiError(404, 'Target user has no company memberships');
  }

  if (!isSelf) {
    const targetCompanyIds = new Set(targetMemberships.map((m) => m.companyId));
    const isManager = requesterMemberships.some(
      (m) => targetCompanyIds.has(m.companyId) && (m.role === 'pm' || m.role === 'company_admin'),
    );
    if (!isManager) {
      throw new ApiError(403, 'You can only view your own stats unless you are a PM or admin');
    }
  }

  const targetCompanyIds = new Set(targetMemberships.map((m) => m.companyId));
  const sharedCompanyId = isSelf
    ? targetMemberships[0].companyId
    : (requesterMemberships.find((m) => targetCompanyIds.has(m.companyId))?.companyId ??
      targetMemberships[0].companyId);

  const matchStage: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(targetUserId) };
  if (projectId) matchStage.projectId = new mongoose.Types.ObjectId(projectId);

  const [perProject, overall] = await Promise.all([
    DailyUpdateModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$projectId',
          totalHours: { $sum: '$hoursSpent' },
          updateCount: { $sum: 1 },
          confidences: { $push: '$confidence' },
        },
      },
    ]),
    DailyUpdateModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          categories: { $push: '$category' },
          lastUpdateDate: { $max: '$date' },
        },
      },
    ]),
  ]);

  const datesResult = (await DailyUpdateModel.distinct('date', matchStage)) as Date[];
  const streak = computeStreak(datesResult as Date[]);

  const projects = perProject.map((p) => ({
    projectId: p._id.toString(),
    totalHours: p.totalHours,
    updateCount: p.updateCount,
    avgConfidence: avgConfidence(p.confidences),
  }));

  const overallData = overall[0];

  return {
    userId: targetUserId,
    companyId: sharedCompanyId,
    lastUpdateDate: overallData?.lastUpdateDate ?? null,
    currentStreak: streak,
    categoryBreakdown: overallData
      ? categoryCounts(overallData.categories)
      : { ...ZERO_CATEGORY_BREAKDOWN },
    projects,
  };
}

export async function getConfidenceTrend(
  projectId: string,
  requestingUserId: string,
  days: number = 30,
): Promise<ConfidenceTrendResponse> {
  const project = await ProjectModel.findById(projectId).lean();
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const membership = await assertCompanyAccess(project.companyId.toString(), requestingUserId);

  const isManager = membership.role === 'pm' || membership.role === 'company_admin';
  const isMember = project.memberIds.some((id) => id.toString() === requestingUserId);
  if (!isManager && !isMember) {
    throw new ApiError(403, 'You are not authorized to view analytics for this project');
  }

  const since = new Date(Date.now() - days * 86400000);

  const raw = await DailyUpdateModel.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
        date: { $gte: since },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'UTC' } },
        confidences: { $push: '$confidence' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return raw.map((row) => {
    const counts = confidenceCounts(row.confidences);
    return { date: row._id, low: counts.low, medium: counts.medium, high: counts.high };
  });
}

export async function getStaleMembers(
  projectId: string,
  requestingUserId: string,
  thresholdDays: number = 3,
): Promise<StaleMemberResponse[]> {
  const project = await ProjectModel.findById(projectId).lean();
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const membership = await assertCompanyAccess(project.companyId.toString(), requestingUserId);

  if (membership.role !== 'pm' && membership.role !== 'company_admin') {
    throw new ApiError(403, 'Only PMs or company admins can view stale members');
  }

  const cutoff = new Date(Date.now() - thresholdDays * 86400000);

  const aggResult = await DailyUpdateModel.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: { $in: project.memberIds },
      },
    },
    {
      $group: {
        _id: '$userId',
        lastUpdateDate: { $max: '$date' },
      },
    },
  ]);

  const latestByUser = new Map<string, Date>();
  for (const r of aggResult) {
    latestByUser.set(r._id.toString(), r.lastUpdateDate);
  }

  const now = new Date();
  const projectCreated = (project as { createdAt?: Date }).createdAt ?? now;

  const all = project.memberIds.map((id) => {
    const idStr = id.toString();
    const lastDate = latestByUser.get(idStr) ?? null;
    const reference = lastDate ?? projectCreated;
    const daysSinceUpdate = Math.floor((now.getTime() - new Date(reference).getTime()) / 86400000);
    return { userId: idStr, lastUpdateDate: lastDate, daysSinceUpdate };
  });

  return all
    .filter((m) => !m.lastUpdateDate || m.lastUpdateDate < cutoff)
    .sort((a, b) => {
      if (a.lastUpdateDate === null) return 1;
      if (b.lastUpdateDate === null) return -1;
      return new Date(b.lastUpdateDate).getTime() - new Date(a.lastUpdateDate).getTime();
    });
}
