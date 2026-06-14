import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ApiError, removedUnusedMulterImageFilesOnError } from "../utils";
import multer from "multer";

type RequestWithFile = Request & {
    file?: multer.Options["fileFilter"];
    files?: multer.Options["fileFilter"];
};

const errorHandler: ErrorRequestHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    let error: any = err as ApiError;

    if (!(error instanceof ApiError)) {
        const statusCode = error instanceof mongoose.Error ? 400 : 500;
        const message = (error as Error).message || "Error: Something went wrong";

        error = new ApiError(statusCode, message, (error as any)?.errors || [], (error as Error).stack);
    }

    const response = {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    res.locals.errorMessage = error.message;
    console.log(error?.errors);

    const reqWithFile = req as RequestWithFile;
    if (reqWithFile.file || reqWithFile.files) {
        removedUnusedMulterImageFilesOnError(req as any);
    }

    res.status(error.statusCode).json(response);
};

export { errorHandler };
