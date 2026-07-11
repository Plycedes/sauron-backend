import { Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as inviteAdminService from '../../services/admin/invite.admin.service';

export const listInvites = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { page, limit, status, companyId } = req.query as {
    page?: string;
    limit?: string;
    status?: string;
    companyId?: string;
  };

  const result = await inviteAdminService.listInvites({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status,
    companyId,
  });

  sendResponse(res, 200, result, 'Invites retrieved successfully');
});

export const deleteInvite = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { inviteId } = req.params;
  await inviteAdminService.deleteInvite(inviteId);
  sendResponse(res, 200, null, 'Invite deleted successfully');
});
