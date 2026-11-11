import type { ChatRequest } from "../types/chat.js";
import { generateLLMResponse } from "./llm.services.js";

export async function processChat(input: ChatRequest): Promise<string> {
    return await generateLLMResponse(input);
}
