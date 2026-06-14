import { z } from "zod";

export const ProjectSchema = {
    create: {
        body: z.object({
            name: z.string().min(2, "Project name must be at least 2 characters"),
            description: z.string().min(10, "Description must be at least 10 characters"),
            companyId: z.string().min(1, "Company ID is required"),
        }),
    },
    assignMember: {
        body: z.object({
            userId: z.string().min(1, "User ID is required"),
        }),
    },
    getByCompany: {
        query: z.object({
            companyId: z.string().min(1, "Company ID is required"),
        }),
    },
};
