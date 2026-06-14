import { Request, Response, NextFunction } from "express";
import { jwt, ApiError } from "../utils";

export interface AuthRequest extends Request {
    userId?: string;
}

export function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch {
        throw new ApiError(401, "Invalid or expired token");
    }
}
