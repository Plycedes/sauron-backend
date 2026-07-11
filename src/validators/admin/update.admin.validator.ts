import { z } from 'zod';

export const UpdateAdminSchema = {
  listUpdates: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      companyId: z.string().optional(),
      projectId: z.string().optional(),
      userId: z.string().optional(),
      category: z
        .enum(['feature', 'bug', 'review', 'meeting', 'research', 'deployment'])
        .optional(),
      confidence: z.enum(['low', 'medium', 'high']).optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }),
  },
};
