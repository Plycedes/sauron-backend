import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils";

interface ValidationSchema {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

function replaceProperties<T extends object>(target: T, parsed: unknown): void {
    for (const key of Object.keys(target)) {
        delete (target as Record<string, unknown>)[key];
    }
    if (parsed && typeof parsed === "object") {
        Object.assign(target, parsed);
    }
}

export function validate(schema: ValidationSchema) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (schema.body) {
                replaceProperties(req.body, schema.body.parse(req.body));
            }
            if (schema.query) {
                replaceProperties(req.query, schema.query.parse(req.query));
            }
            if (schema.params) {
                replaceProperties(req.params, schema.params.parse(req.params));
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
