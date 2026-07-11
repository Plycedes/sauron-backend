import { z } from 'zod';

export const InviteAdminSchema = {
  listInvites: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      status: z.enum(['pending', 'accepted', 'expired']).optional(),
      companyId: z.string().optional(),
    }),
  },
};
