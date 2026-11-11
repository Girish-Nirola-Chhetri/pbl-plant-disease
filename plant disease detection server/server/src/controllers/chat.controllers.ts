import type { Request, Response } from "express";

import { processChat } from "../services/chat.services.js";
import type { ChatRequest } from "../types/chat.js";

export async function chatController(
    req: Request,
    res: Response
) {
    try {
        const {
            crop,
            disease,
            context,
            messages,
        } = req.body as Partial<ChatRequest>;

        if (!crop || typeof crop !== "string") {
            return res.status(400).json({
                error: "crop is required",
            });
        }

        if (!disease || typeof disease !== "string") {
            return res.status(400).json({
                error: "disease is required",
            });
        }

        if (!context || typeof context !== "object") {
            return res.status(400).json({
                error: "disease context is required",
            });
        }

        if (!Array.isArray(messages)) {
            return res.status(400).json({
                error: "messages must be an array",
            });
        }

        const reply = await processChat({
            crop,
            disease,
            context,
            messages,
        });

        return res.status(200).json({
            reply,
        });
    } catch (error) {
        console.error("Chat controller error:", error);

        return res.status(500).json({
            error: "Failed to process chat request",
        });
    }
}