import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils";

interface ValidationSchema {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export function validate(schema: ValidationSchema) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.query) {
                req.query = schema.query.parse(req.query) as typeof req.query;
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params) as typeof req.params;
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map(
                    (issue) => `${issue.path.join(".")}: ${issue.message}`
                );
                next(new ApiError(400, "Validation failed", errors));
            } else {
                next(error);
            }
        }
    };
}
