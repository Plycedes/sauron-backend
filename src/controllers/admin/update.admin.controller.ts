import { Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as updateAdminService from '../../services/admin/update.admin.service';

export const listUpdates = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { page, limit, companyId, projectId, userId, category, confidence, dateFrom, dateTo } =
    req.query as Record<string, string | undefined>;

  const result = await updateAdminService.listUpdates({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    companyId,
    projectId,
    userId,
    category,
    confidence,
    dateFrom,
    dateTo,
  });

  sendResponse(res, 200, result, 'Updates retrieved successfully');
});

export const getUpdateById = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { updateId } = req.params;
    const result = await updateAdminService.getUpdateById(updateId);
    sendResponse(res, 200, result, 'Update retrieved successfully');
  },
);

export const deleteUpdate = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { updateId } = req.params;
  await updateAdminService.deleteUpdate(updateId);
  sendResponse(res, 200, null, 'Update and associated embedding deleted successfully');
});
