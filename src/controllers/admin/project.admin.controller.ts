import { Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as projectAdminService from '../../services/admin/project.admin.service';

export const listProjects = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { page, limit, search, companyId, status } = req.query as {
    page?: string;
    limit?: string;
    search?: string;
    companyId?: string;
    status?: string;
  };

  const result = await projectAdminService.listProjects({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search,
    companyId,
    status,
  });

  sendResponse(res, 200, result, 'Projects retrieved successfully');
});

export const getProjectById = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const result = await projectAdminService.getProjectById(projectId);
    sendResponse(res, 200, result, 'Project retrieved successfully');
  },
);

export const updateProjectStatus = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const { status } = req.body as { status: string };
    const result = await projectAdminService.updateProjectStatus(projectId, status);
    sendResponse(res, 200, result, 'Project status updated successfully');
  },
);

export const deleteProject = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId } = req.params;
    await projectAdminService.deleteProject(projectId);
    sendResponse(res, 200, null, 'Project and associated data deleted successfully');
  },
);
