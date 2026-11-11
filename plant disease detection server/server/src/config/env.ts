import "dotenv/config";

const nodeEnv = process.env.NODE_ENV || "development";
if (!["development", "test", "production"].includes(nodeEnv)) {
    throw new Error("NODE_ENV must be development, test, or production");
}

const portValue = process.env.PORT ?? "3000";
const PORT = Number(portValue);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();
if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing from environment variables");
}

const OPENROUTER_MODEL =
    process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";

const CLIENT_URL =
    process.env.CLIENT_URL?.trim() ||
    (nodeEnv === "production"
        ? ""
        : "http://localhost:5173");

if (!CLIENT_URL) {
    throw new Error("CLIENT_URL must be set in production");
}

let parsedClientUrl: URL;
try {
    parsedClientUrl = new URL(CLIENT_URL);
} catch {
    throw new Error("CLIENT_URL must be a valid absolute URL");
}

if (!["http:", "https:"].includes(parsedClientUrl.protocol)) {
    throw new Error("CLIENT_URL must use HTTP or HTTPS");
}

export const env = {
    NODE_ENV: nodeEnv,
    PORT,
    CLIENT_URL: parsedClientUrl.origin,
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
};
