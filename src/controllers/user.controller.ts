import { Response } from "express";
import { asyncHandler, sendResponse } from "../utils";
import { userService } from "../services";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.params.id as string;

    const user = await userService.getUser(userId);

    sendResponse(res, 200, user, "User retrieved successfully");
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.params.id as string;
    const data = req.body;

    const user = await userService.updateUser(userId, data);

    sendResponse(res, 200, user, "User updated successfully");
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.params.id as string;

    await userService.deleteUser(userId);

    sendResponse(res, 200, {}, "User deleted successfully");
});
