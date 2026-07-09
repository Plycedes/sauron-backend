import { z } from 'zod';

export const MembershipSchema = {
  updateRole: {
    body: z.object({
      role: z.enum(['company_admin', 'pm', 'member']),
    }),
  },
};
