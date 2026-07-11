import { z } from 'zod';

export const UserAdminSchema = {
  listUsers: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      search: z.string().optional(),
      status: z.enum(['active', 'pending', 'suspended']).optional(),
    }),
  },
  updateStatus: {
    body: z.object({
      status: z.enum(['active', 'suspended']),
    }),
  },
  updateRole: {
    body: z.object({
      role: z.enum(['user', 'super_admin']),
    }),
  },
};
