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

// The key is only needed when a chat request reaches OpenRouter, so tests
// (which mock or never call the LLM) can run without one.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim() ?? "";
if (!OPENROUTER_API_KEY && nodeEnv !== "test") {
    throw new Error("OPENROUTER_API_KEY is missing from environment variables");
}

const OPENROUTER_MODEL =
    process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";

// CLIENT_URL may be a single origin or a comma-separated list, e.g.
// "http://localhost:5173,http://127.0.0.1:5173".
const CLIENT_URL_RAW =
    process.env.CLIENT_URL?.trim() ||
    (nodeEnv === "production"
        ? ""
        : "http://localhost:5173");

if (!CLIENT_URL_RAW) {
    throw new Error("CLIENT_URL must be set in production");
}

const CLIENT_ORIGINS = CLIENT_URL_RAW
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
        let parsed: URL;
        try {
            parsed = new URL(value);
        } catch {
            throw new Error("CLIENT_URL must contain valid absolute URLs");
        }
        if (!["http:", "https:"].includes(parsed.protocol)) {
            throw new Error("CLIENT_URL must use HTTP or HTTPS");
        }
        return parsed.origin;
    });

if (CLIENT_ORIGINS.length === 0) {
    throw new Error("CLIENT_URL must contain at least one origin");
}

// Number of reverse-proxy hops in front of the app (0 = not behind a proxy).
const TRUST_PROXY = Number(process.env.TRUST_PROXY ?? "0");
if (!Number.isInteger(TRUST_PROXY) || TRUST_PROXY < 0 || TRUST_PROXY > 10) {
    throw new Error("TRUST_PROXY must be an integer between 0 and 10");
}

export const env = {
    NODE_ENV: nodeEnv,
    PORT,
    CLIENT_URL: CLIENT_ORIGINS[0],
    CLIENT_ORIGINS,
    TRUST_PROXY,
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
};
