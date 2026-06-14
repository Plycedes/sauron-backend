import { Response } from "express";
import { asyncHandler, sendResponse } from "../utils";
import { inviteService } from "../services";
import { AuthRequest } from "../middlewares/auth.middleware";

export const sendInvite = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await inviteService.sendInvite(req.body, req.userId!);

    sendResponse(res, 201, result, "Invite sent successfully");
});

export const acceptInvite = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    await inviteService.acceptInvite(req.body.token, req.userId!);

    sendResponse(res, 200, {}, "Invite accepted successfully");
});
