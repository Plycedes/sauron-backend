import { z } from "zod";

export const CompanySchema = {
    create: {
        body: z.object({
            name: z.string().min(2, "Company name must be at least 2 characters"),
            domain: z.string().min(3, "Domain must be at least 3 characters"),
        }),
    },
};
