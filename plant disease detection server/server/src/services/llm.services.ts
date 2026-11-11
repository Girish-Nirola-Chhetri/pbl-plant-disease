import type { ChatRequest } from "../types/chat.js";
import { env } from "../config/env.js";

const OPENROUTER_URL =
    "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `
You are a plant disease information assistant.

The plant disease has already been identified by a
machine-learning model. You must NOT attempt to
rediagnose the image or claim that your response
changes the model's prediction.

Your job is to explain the identified disease using
the provided disease context.

Rules:
- Base factual disease information primarily on the
  provided disease context.
- Do not invent treatments, pesticides, dosages, or
  application rates.
- If the provided context does not contain enough
  information to answer something safely, say so.
- Give practical, understandable answers.
- Keep answers concise unless the user asks for detail.
- If the user asks something unrelated to the disease,
  answer briefly if appropriate, but keep the conversation
  focused on plant health.
`;

export async function generateLLMResponse(
    request: ChatRequest
): Promise<string> {
    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT,
        },
        {
            role: "system",
            content: `
Detected crop:
${request.crop}

Detected disease:
${request.disease}

Disease information:
Description:
${request.context.description}

Symptoms:
- ${request.context.symptoms.join("\n- ")}

Treatment:
- ${request.context.treatment.join("\n- ")}

Prevention:
- ${request.context.prevention.join("\n- ")}
            `,
        },
        ...request.messages,
    ];

    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: env.OPENROUTER_MODEL,
            messages,
            temperature: 0.3,
            max_tokens: 500,
        }),
        signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
        // Do not log the upstream body: it may contain sensitive request details.
        console.error("OpenRouter request failed with status:", response.status);
        throw new Error(`OpenRouter request failed: ${response.status}`);
    }

    const data: unknown = await response.json();
    const reply = (
        data as {
            choices?: Array<{ message?: { content?: unknown } }>;
        }
    )?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("OpenRouter returned an empty response");
    }

    return reply.trim();
}
