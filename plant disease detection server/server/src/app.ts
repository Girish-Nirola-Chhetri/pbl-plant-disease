import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import chatRoutes from "./routes/chat.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { errorMiddleware } from "./middlewares/error.middlewares.js";
import { chatRateLimiter } from "./middlewares/rate-limit.middlewares.js";
import { securityHeaders } from "./middlewares/security.middlewares.js";

const app = express();

app.disable("x-powered-by");
app.use(securityHeaders);

app.use(
    cors({
        origin: env.CLIENT_URL,
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

app.use(errorMiddleware);

app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});
