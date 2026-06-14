import { z } from "zod";

export const AnalyticsSchema = {
    projectStats: {
        params: z.object({
            projectId: z.string().min(1, "Project ID is required"),
        }),
    },
    userStats: {
        params: z.object({
            userId: z.string().min(1, "User ID is required"),
        }),
        query: z.object({
            projectId: z.string().optional(),
        }),
    },
    confidenceTrend: {
        params: z.object({
            projectId: z.string().min(1, "Project ID is required"),
        }),
        query: z.object({
            days: z.coerce.number().int().positive().default(30),
        }),
    },
    staleMembers: {
        params: z.object({
            projectId: z.string().min(1, "Project ID is required"),
        }),
        query: z.object({
            thresholdDays: z.coerce.number().int().positive().default(3),
        }),
    },
};
