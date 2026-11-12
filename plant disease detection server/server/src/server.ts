import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
    console.log(`Plant Disease Detection API listening on port ${env.PORT}`);
});

function shutdown(signal: string) {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
    // Force exit if connections do not drain in time.
    setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
