import { companyRepository } from "../repositories";
import { UserModel } from "../models/mongo";
import { ApiError } from "../utils/ApiError";
import { CompanyInput, CompanyResponse } from "../types/company.types";

export async function createCompany(adminId: string, input: CompanyInput): Promise<CompanyResponse> {
    const existing = await companyRepository.findByDomain(input.domain);
    if (existing) {
        throw new ApiError(409, "Company domain already taken");
    }

    const company = await companyRepository.create({ ...input, adminId });

    await UserModel.findByIdAndUpdate(adminId, { companyId: company._id });

    return company;
}

export async function getCompany(companyId: string, requestingUserId: string): Promise<CompanyResponse> {
    const company = await companyRepository.findById(companyId);
    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    const user = await UserModel.findById(requestingUserId).lean();
    if (!user) {
        throw new ApiError(404, "Requesting user not found");
    }

    if (!user.companyId || user.companyId.toString() !== companyId) {
        throw new ApiError(403, "You do not belong to this company");
    }

    return company;
}
