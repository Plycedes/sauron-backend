import { Response } from "express";
import { asyncHandler, sendResponse } from "../utils";
import { analyticsService } from "../services";
import { AuthRequest } from "../middlewares/auth.middleware";

export const projectStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId } = req.params as { projectId: string };

    const result = await analyticsService.getProjectStats(projectId, req.userId!);

    sendResponse(res, 200, result, "Project stats retrieved successfully");
});

export const userStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };

    const result = await analyticsService.getUserStats(userId, req.userId!, req.query.projectId as string | undefined);

    sendResponse(res, 200, result, "User stats retrieved successfully");
});

export const confidenceTrend = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId } = req.params as { projectId: string };
    const days = req.query.days ? Number(req.query.days) : 30;

    const result = await analyticsService.getConfidenceTrend(projectId, req.userId!, days);

    sendResponse(res, 200, result, "Confidence trend retrieved successfully");
});

export const staleMembers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId } = req.params as { projectId: string };
    const thresholdDays = req.query.thresholdDays ? Number(req.query.thresholdDays) : 3;

    const result = await analyticsService.getStaleMembers(projectId, req.userId!, thresholdDays);

    sendResponse(res, 200, result, "Stale members retrieved successfully");
});
