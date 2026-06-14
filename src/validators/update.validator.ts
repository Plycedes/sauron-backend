import { z } from "zod";

const categoryEnum = z.enum(["feature", "bug", "review", "meeting", "research", "deployment"]);
const confidenceEnum = z.enum(["low", "medium", "high"]);

export const UpdateSchema = {
    submit: {
        body: z.object({
            projectId: z.string().min(1, "Project ID is required"),
            completed: z.string().min(30, "Completed must be at least 30 characters"),
            nextSteps: z.string().min(20, "Next steps must be at least 20 characters"),
            blockers: z.string().default("None"),
            category: categoryEnum,
            hoursSpent: z.number().min(0.5, "Hours spent must be at least 0.5").max(12, "Hours spent must be at most 12"),
            confidence: confidenceEnum,
        }),
    },
    getByProject: {
        query: z.object({
            projectId: z.string().min(1, "Project ID is required"),
            from: z.coerce.date().optional(),
            to: z.coerce.date().optional(),
        }),
    },
    getByUser: {
        query: z.object({
            userId: z.string().min(1, "User ID is required"),
            projectId: z.string().optional(),
            from: z.coerce.date().optional(),
            to: z.coerce.date().optional(),
        }),
    },
};
