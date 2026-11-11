import { ChatRequest } from "../types/chat.js";
import { generateLLMResponse } from "./llm.services.js";

export async function processChat(input: ChatRequest): Promise<string> {
    const response = generateLLMResponse(input);
    console.log(response)

    return response
}