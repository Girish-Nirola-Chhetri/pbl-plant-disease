import "dotenv/config";

const PORT = Number(process.env.PORT) || 3000;

const OPENROUTER_API_KEY =
    process.env.OPENROUTER_API_KEY;

const OPENROUTER_MODEL =
    process.env.OPENROUTER_MODEL || "openrouter/free";

if (!OPENROUTER_API_KEY) {
    throw new Error(
        "OPENROUTER_API_KEY is missing from environment variables"
    );
}

export const env = {
    PORT,
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
};