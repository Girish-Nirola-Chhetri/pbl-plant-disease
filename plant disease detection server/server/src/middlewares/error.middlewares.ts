import type {
    NextFunction,
    Request,
    Response,
} from "express";

type HttpError = Error & {
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
    if (res.headersSent) {
        return next(error);
    }

    const httpError = error as HttpError;
    const errorType = httpError?.type;

    if (errorType === "entity.too.large") {
        return res.status(413).json({ error: "Request body is too large" });
    }

    if (errorType === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid JSON body" });
    }

    const candidateStatus = httpError?.status ?? httpError?.statusCode;
    const status =
        Number.isInteger(candidateStatus) &&
        (candidateStatus as number) >= 400 &&
        (candidateStatus as number) < 600
            ? candidateStatus as number
            : 500;

    if (status >= 500) {
        console.error(
            "Unhandled request error:",
            error instanceof Error ? error.message : "Unknown error"
        );
    }

    const publicMessages: Record<number, string> = {
        400: "Invalid request",
        502: "AI service is temporarily unavailable",
        503: "AI service is rate limited. Please try again later",
        504: "AI service request timed out",
    };

    return res.status(status).json({
        error: publicMessages[status] ?? (status >= 500 ? "Internal server error" : "Invalid request"),
    });
}
