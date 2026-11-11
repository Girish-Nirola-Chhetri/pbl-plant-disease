import type { Request, Response, NextFunction } from "express";
import type { ChatRequest } from "../types/chat.js";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown, maxItems: number, maxLength: number) {
    return Array.isArray(value) &&
        value.length <= maxItems &&
        value.every((item) =>
            typeof item === "string" &&
            item.trim().length > 0 &&
            item.length <= maxLength
        );
}

export function validateChatBody(req: Request, res: Response, next: NextFunction) {
    const body: unknown = req.body;
    const errors: string[] = [];

    if (!isRecord(body)) {
        return res.status(400).json({ error: "Request body must be a JSON object" });
    }

    const allowedKeys = ["crop", "disease", "context", "messages"];
    if (Object.keys(body).some((key) => !allowedKeys.includes(key))) {
        errors.push("Unknown request fields are not allowed");
    }

    if (typeof body.crop !== "string" || !body.crop.trim() || body.crop.length > 100) {
        errors.push("crop must be a non-empty string of at most 100 characters");
    }
    if (typeof body.disease !== "string" || !body.disease.trim() || body.disease.length > 150) {
        errors.push("disease must be a non-empty string of at most 150 characters");
    }

    const context = body.context;
    if (!isRecord(context)) {
        errors.push("context must be an object");
    } else {
        const contextKeys = ["description", "symptoms", "treatment", "prevention"];
        if (Object.keys(context).some((key) => !contextKeys.includes(key))) {
            errors.push("Unknown context fields are not allowed");
        }
        if (typeof context.description !== "string" || context.description.length > 3000) {
            errors.push("context.description must be a string of at most 3000 characters");
        }
        if (!isStringArray(context.symptoms, 20, 500)) {
            errors.push("context.symptoms must contain at most 20 strings of at most 500 characters");
        }
        if (!isStringArray(context.treatment, 20, 500)) {
            errors.push("context.treatment must contain at most 20 strings of at most 500 characters");
        }
        if (!isStringArray(context.prevention, 20, 500)) {
            errors.push("context.prevention must contain at most 20 strings of at most 500 characters");
        }
    }

    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 20) {
        errors.push("messages must contain between 1 and 20 entries");
    } else {
        for (const [index, message] of body.messages.entries()) {
            if (
                !isRecord(message) ||
                Object.keys(message).some((key) => !["role", "content"].includes(key)) ||
                !["user", "assistant"].includes(String(message.role)) ||
                typeof message.content !== "string" ||
                !message.content.trim() ||
                message.content.length > 4000
            ) {
                errors.push(`messages[${index}] must have role user/assistant and non-empty content up to 4000 characters`);
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: "Invalid request body", details: errors });
    }

    const validContext = context as Record<string, unknown>;
    req.body = {
        crop: (body.crop as string).trim(),
        disease: (body.disease as string).trim(),
        context: {
            description: (validContext.description as string).trim(),
            symptoms: (validContext.symptoms as string[]).map((item) => item.trim()),
            treatment: (validContext.treatment as string[]).map((item) => item.trim()),
            prevention: (validContext.prevention as string[]).map((item) => item.trim()),
        },
        messages: (body.messages as Array<{ role: "user" | "assistant"; content: string }>).map(
            (message) => ({ role: message.role, content: message.content.trim() })
        ),
    } satisfies ChatRequest;

    return next();
}
