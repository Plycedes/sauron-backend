import { z } from "zod";

export const UserSchema = {
    update: {
        body: z.object({
            fullName: z.string().min(2).optional(),
            avatar: z.string().url().optional(),
        }),
    },
};
