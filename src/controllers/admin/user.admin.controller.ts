import { Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as userAdminService from '../../services/admin/user.admin.service';

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { page, limit, search, status } = req.query as {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  };

  const result = await userAdminService.listUsers({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search,
    status,
  });

  sendResponse(res, 200, result, 'Users retrieved successfully');
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params as { userId: string };
  const result = await userAdminService.getUserById(userId);
  sendResponse(res, 200, result, 'User retrieved successfully');
});

export const updateUserStatus = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const { status } = req.body as { status: string };
    const result = await userAdminService.updateUserStatus(userId, status);
    sendResponse(res, 200, result, 'User status updated successfully');
  },
);

export const updateUserRole = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const { role } = req.body as { role: string };
    const result = await userAdminService.updateUserRole(userId, role);
    sendResponse(res, 200, result, 'User role updated successfully');
  },
);

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params as { userId: string };
  await userAdminService.deleteUser(userId);
  sendResponse(res, 200, null, 'User deleted successfully');
});
