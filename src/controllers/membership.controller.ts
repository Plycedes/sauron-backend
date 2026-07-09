import { Response } from 'express';
import { asyncHandler, sendResponse } from '../utils';
import { membershipService } from '../services';
import { AuthRequest } from '../middlewares/auth.middleware';
import { MembershipRole } from '../types/membership.types';

export const getMyCompanies = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const companies = await membershipService.getUserCompanies(req.userId!);

    sendResponse(res, 200, companies, 'Companies retrieved successfully');
  },
);

export const getCompanyMembers = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const members = await membershipService.getCompanyMembers(req.companyId!);

    sendResponse(res, 200, members, 'Members retrieved successfully');
  },
);

export const updateMemberRole = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const { role } = req.body as { role: MembershipRole };

    const updated = await membershipService.updateMemberRole(
      req.companyId!,
      userId,
      req.userId!,
      role,
    );

    sendResponse(res, 200, updated, 'Member role updated successfully');
  },
);

export const removeMember = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params as { userId: string };

  await membershipService.removeMember(req.companyId!, userId, req.userId!);

  sendResponse(res, 200, {}, 'Member removed successfully');
});
