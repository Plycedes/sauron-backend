import { Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as companyAdminService from '../../services/admin/company.admin.service';

export const listCompanies = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };

    const result = await companyAdminService.listCompanies({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });

    sendResponse(res, 200, result, 'Companies retrieved successfully');
  },
);

export const getCompanyById = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { companyId } = req.params as { companyId: string };
    const result = await companyAdminService.getCompanyById(companyId);
    sendResponse(res, 200, result, 'Company retrieved successfully');
  },
);

export const deleteCompany = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { companyId } = req.params as { companyId: string };
    await companyAdminService.deleteCompany(companyId);
    sendResponse(res, 200, null, 'Company and all associated data deleted successfully');
  },
);
