import rateLimit from "express-rate-limit";

export const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: "Too many requests, please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Too many uploads, please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});
