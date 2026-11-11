import type { Request, Response } from "express";

import { processChat } from "../services/chat.services.js";
import type { ChatRequest } from "../types/chat.js";

export async function chatController(
    req: Request<Record<string, never>, unknown, ChatRequest>,
    res: Response
) {
    const reply = await processChat(req.body);

    return res.status(200).json({ reply });
}
