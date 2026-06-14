import { z } from "zod";

export const RagSchema = {
    query: {
        body: z.object({
            question: z.string().min(10, "Question must be at least 10 characters"),
            companyId: z.string().min(1, "Company ID is required"),
            projectId: z.string().optional(),
            userId: z.string().optional(),
            dateFrom: z.coerce.date().optional(),
            dateTo: z.coerce.date().optional(),
        }),
    },
};
