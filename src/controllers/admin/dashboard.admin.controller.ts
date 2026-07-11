import { Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as dashboardAdminService from '../../services/admin/dashboard.admin.service';

export const getStats = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const result = await dashboardAdminService.getStats();
  sendResponse(res, 200, result, 'Dashboard stats retrieved successfully');
});
