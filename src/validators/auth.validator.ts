import { z } from "zod";

export const AuthSchema = {
    register: {
        body: z
            .object({
                fullName: z.string().min(2, "Full name must be at least 2 characters"),
                userId: z.string().min(3, "User ID must be at least 3 characters"),
                email: z.string().email("Invalid email format"),
                password: z.string().min(8, "Password must be at least 8 characters"),
                confirmPassword: z.string().min(8, "Please confirm your password"),
            })
            .refine((data) => data.password === data.confirmPassword, {
                message: "Passwords do not match",
                path: ["confirmPassword"],
            }),
    },

    login: {
        body: z.object({
            userId: z.string().min(1, "User ID is required"),
            password: z.string().min(1, "Password is required"),
        }),
    },

    logout: {
        body: z
            .object({
                allDevices: z.boolean().optional(),
            })
            .optional(),
    },

    refresh: {
        body: z.object({
            refreshToken: z.string().min(1, "Refresh token is required"),
        }),
    },
};
