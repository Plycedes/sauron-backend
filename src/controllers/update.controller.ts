import { Response } from "express";
import { asyncHandler, sendResponse } from "../utils";
import { updateService } from "../services";
import { AuthRequest } from "../middlewares/auth.middleware";

export const submitUpdate = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await updateService.submitUpdate(req.body, req.userId!);

    sendResponse(res, 201, result, "Update submitted successfully");
});

export const getByProject = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await updateService.getUpdatesByProject(
        req.query.projectId as string,
        req.userId!,
        req.query.from as Date | undefined,
        req.query.to as Date | undefined,
    );

    sendResponse(res, 200, result, "Updates retrieved successfully");
});

export const getByUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await updateService.getUpdatesByUser(
        req.query.userId as string,
        req.userId!,
        req.query.projectId as string | undefined,
        req.query.from as Date | undefined,
        req.query.to as Date | undefined,
    );

    sendResponse(res, 200, result, "Updates retrieved successfully");
});
