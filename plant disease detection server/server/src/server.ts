import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
});

let isShuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`${signal} received. Closing HTTP server...`);

    const forceShutdownTimer = setTimeout(() => {
        console.error("Graceful shutdown timed out. Closing active connections.");
        server.closeAllConnections();
    }, 10_000);

    forceShutdownTimer.unref();

    server.close((error) => {
        clearTimeout(forceShutdownTimer);

        if (error) {
            console.error("Error while closing HTTP server:", error);
            process.exitCode = 1;
            return;
        }

        console.log("HTTP server closed.");
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.on("error", (error) => {
    console.error("HTTP server failed to start:", error);
    process.exitCode = 1;
});
