import { Response } from "express";
import { asyncHandler, sendResponse } from "../utils";
import { ragService } from "../services";
import { AuthRequest } from "../middlewares/auth.middleware";

export const query = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await ragService.query(req.body, req.userId!);

    sendResponse(res, 200, result, "RAG query completed");
});
