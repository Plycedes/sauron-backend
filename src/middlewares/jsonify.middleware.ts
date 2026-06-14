import { Request, Response, NextFunction } from "express";

export function autoJsonify(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.body && typeof req.body === "object") {
            for (const key of Object.keys(req.body)) {
                const value = req.body[key];

                if (typeof value === "string" && isProbablyJson(value)) {
                    try {
                        req.body[key] = JSON.parse(value);
                    } catch {
                        // ignore parse errors, keep original string
                    }
                }
            }
        }

        next();
    } catch (err) {
        next(err);
    }
}

function isProbablyJson(str: string): boolean {
    if (!str) return false;
    const trimmed = str.trim();
    return trimmed.startsWith("{") || trimmed.startsWith("[");
}
