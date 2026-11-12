import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { HttpError } from "../errors/http-error.js";

type ExpressError = Error & {
    status?: number;
    statusCode?: number;
    type?: string;
};

export function errorMiddleware(
    error: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
) {
    // Let Express's default handler close the connection if a response has
    // already started.
    if (res.headersSent) {
        return next(error);
    }

    // Errors we raised on purpose with a client-safe message.
    if (error instanceof HttpError) {
        return res.status(error.status).json({
            error: error.publicMessage,
        });
    }

    const httpError = error as ExpressError;
    const errorType = httpError?.type;

    if (errorType === "entity.too.large") {
        return res.status(413).json({
            error: "Request body is too large",
        });
    }

    if (errorType === "entity.parse.failed") {
        return res.status(400).json({
            error: "Invalid JSON body",
        });
    }

    const status =
        Number.isInteger(httpError?.status) &&
        (httpError.status as number) >= 400 &&
        (httpError.status as number) < 500
            ? httpError.status as number
            : 500;

    if (status === 500) {
        const message =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Unhandled request error:", message);
    }

    return res.status(status).json({
        error: status === 500
            ? "Internal server error"
            : "Invalid request",
    });
}
