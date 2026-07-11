import {
  UserModel,
  CompanyModel,
  ProjectModel,
  DailyUpdateModel,
  InviteModel,
} from '../../models/mongo';
import { IDashboardStats } from '../../types/admin.types';

export async function getStats(): Promise<IDashboardStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalCompanies,
    totalProjects,
    activeProjects,
    totalUpdates,
    pendingInvites,
    expiredInvites,
    newUsersLast7Days,
    updatesLast7Days,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ status: 'active' }),
    UserModel.countDocuments({ status: 'suspended' }),
    CompanyModel.countDocuments(),
    ProjectModel.countDocuments(),
    ProjectModel.countDocuments({ status: 'active' }),
    DailyUpdateModel.countDocuments(),
    InviteModel.countDocuments({ status: 'pending' }),
    InviteModel.countDocuments({ status: 'expired' }),
    UserModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    DailyUpdateModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalCompanies,
    totalProjects,
    activeProjects,
    totalUpdates,
    pendingInvites,
    expiredInvites,
    newUsersLast7Days,
    updatesLast7Days,
  };
}
