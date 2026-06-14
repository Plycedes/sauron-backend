import { Response } from "express";
import { asyncHandler, sendResponse } from "../utils";
import { projectService } from "../services";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createProject = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await projectService.createProject(req.body, req.userId!);

    sendResponse(res, 201, result, "Project created successfully");
});

export const getProjects = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await projectService.getProjectsByCompany(req.query.companyId as string, req.userId!);

    sendResponse(res, 200, result, "Projects retrieved successfully");
});

export const assignMember = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };

    await projectService.assignMember(id, req.body.userId, req.userId!);

    sendResponse(res, 200, {}, "Member assigned successfully");
});

export const removeMember = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id, userId } = req.params as { id: string; userId: string };

    await projectService.removeMember(id, userId, req.userId!);

    sendResponse(res, 200, {}, "Member removed successfully");
});
