import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import chatRoutes from "./routes/chat.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { errorMiddleware } from "./middlewares/error.middlewares.js";
import { chatRateLimiter } from "./middlewares/rate-limit.middlewares.js";
import { securityHeaders } from "./middlewares/security.middlewares.js";

export function createApp() {
    const app = express();

    app.disable("x-powered-by");

    // When running behind a reverse proxy (Render, Railway, Nginx...) set
    // TRUST_PROXY to the number of proxy hops so req.ip is the real client IP.
    // Without it every user shares the proxy's IP and the rate limit.
    if (env.TRUST_PROXY > 0) {
        app.set("trust proxy", env.TRUST_PROXY);
    }

    app.use(securityHeaders);

    app.use(
        cors({
            origin: env.CLIENT_ORIGINS,
            methods: ["GET", "POST", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
            maxAge: 86400,
        })
    );

    // Apply the limiter before parsing so malformed/oversized requests count too.
    app.use("/api/chat", chatRateLimiter);
    app.use(express.json({ limit: "100kb" }));

    app.use("/health", healthRoutes);
    app.use("/api/chat", chatRoutes);

    // Unknown routes: return JSON instead of Express's default HTML page.
    app.use((_req, res) => {
        res.status(404).json({ error: "Not found" });
    });

    app.use(errorMiddleware);

    return app;
}
