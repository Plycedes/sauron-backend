import { Request, Response } from "express";
import { asyncHandler, sendResponse } from "../utils";
import { authService } from "../services";
import { AuthRequest } from "../middlewares/auth.middleware";

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { fullName, userId, email, password } = req.body;

    const result = await authService.register({
        fullName,
        userId,
        email,
        password,
    });

    sendResponse(res, 201, result, "Registration successful");
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, password } = req.body;

    const result = await authService.login({ userId, password });

    sendResponse(res, 200, result, "Login successful");
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const refreshToken = req.body?.refreshToken;
    const allDevices = req.body?.allDevices;

    const result = await authService.logout(userId, refreshToken, allDevices);

    sendResponse(res, 200, result, "Logged out successfully");
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;

    const profile = await authService.getProfile(userId);

    sendResponse(res, 200, profile, "User retrieved successfully");
});

export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    sendResponse(res, 200, result, "Token refreshed successfully");
});
