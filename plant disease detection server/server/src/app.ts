import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import chatRoutes from "./routes/chat.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { errorMiddleware } from "./middlewares/error.middlewares.js";

const app = express();

app.use(
    cors({
        origin: "*",
    })
);

app.use(express.json());
app.use("/health", healthRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorMiddleware);

app.listen(env.PORT, () => {
    console.log(
        `Server running on http://localhost:${env.PORT}`
    );
});