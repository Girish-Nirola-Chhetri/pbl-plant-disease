const { test } = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
process.env.PORT = "3000";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.OPENROUTER_API_KEY = "test-only-key";

const { createApp } = require("../dist/app.js");

async function withServer(app, run) {
    const server = app.listen(0);
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });

    try {
        const address = server.address();
        assert.ok(address && typeof address === "object");
        await run(`http://127.0.0.1:${address.port}`);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
}

test("GET /health returns a healthy status and security headers", async () => {
    await withServer(createApp(), async (baseUrl) => {
        const response = await fetch(`${baseUrl}/health`);

        assert.equal(response.status, 200);
        assert.equal(response.headers.get("x-content-type-options"), "nosniff");
        assert.equal(response.headers.get("x-frame-options"), "DENY");
        assert.equal(response.headers.get("x-powered-by"), null);

        const body = await response.json();
        assert.equal(body.status, "ok");
    });
});

test("chat endpoint rejects malformed JSON with HTTP 400", async () => {
    await withServer(createApp(), async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{invalid-json",
        });

        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { error: "Invalid JSON body" });
    });
});

test("chat endpoint rejects an invalid request body", async () => {
    await withServer(createApp(), async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unexpected: true }),
        });

        assert.equal(response.status, 400);
        const body = await response.json();
        assert.equal(body.error, "Invalid request body");
        assert.ok(Array.isArray(body.details));
    });
});
