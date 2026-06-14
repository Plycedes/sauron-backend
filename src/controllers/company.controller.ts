import { Response } from "express";
import { asyncHandler, sendResponse } from "../utils";
import { companyService } from "../services";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createCompany = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await companyService.createCompany(req.userId!, req.body);

    sendResponse(res, 201, result, "Company created successfully");
});

export const getCompany = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };

    const company = await companyService.getCompany(id, req.userId!);

    sendResponse(res, 200, company, "Company retrieved successfully");
});
