import { z } from 'zod';

export const ProjectAdminSchema = {
  listProjects: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      search: z.string().optional(),
      companyId: z.string().optional(),
      status: z.enum(['active', 'on_hold', 'completed', 'archived']).optional(),
    }),
  },
  updateStatus: {
    body: z.object({
      status: z.enum(['active', 'on_hold', 'completed', 'archived']),
    }),
  },
};
