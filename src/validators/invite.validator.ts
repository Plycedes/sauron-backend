import { z } from "zod";

export const InviteSchema = {
    send: {
        body: z.object({
            email: z.string().email("Invalid email format"),
            companyId: z.string().min(1, "Company ID is required"),
            role: z.enum(["pm", "member"]),
        }),
    },
    accept: {
        body: z.object({
            token: z.string().min(1, "Token is required"),
        }),
    },
};
