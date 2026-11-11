import type { Request, Response, NextFunction } from "express";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const MAX_TRACKED_IPS = 10_000;

type RateLimitEntry = { count: number; resetAt: number };
const requestsByIp = new Map<string, RateLimitEntry>();

export function chatRateLimiter(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    let entry = requestsByIp.get(ip);

    if (!entry || entry.resetAt <= now) {
        // Sweep expired entries only when admitting a new IP, not on every request.
        if (requestsByIp.size >= MAX_TRACKED_IPS) {
            for (const [trackedIp, trackedEntry] of requestsByIp) {
                if (trackedEntry.resetAt <= now) {
                    requestsByIp.delete(trackedIp);
                }
            }
        }

        // Keep memory bounded even if all tracked entries are still active.
        if (requestsByIp.size >= MAX_TRACKED_IPS) {
            const oldestIp = requestsByIp.keys().next().value;
            if (oldestIp) requestsByIp.delete(oldestIp);
        }

        entry = { count: 0, resetAt: now + WINDOW_MS };
        requestsByIp.set(ip, entry);
    }

    entry.count += 1;
    const remaining = Math.max(0, MAX_REQUESTS - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    res.setHeader("RateLimit-Limit", MAX_REQUESTS);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetSeconds);

    if (entry.count > MAX_REQUESTS) {
        res.setHeader("Retry-After", resetSeconds);
        return res.status(429).json({
            error: "Too many chat requests. Please try again later.",
        });
    }

    return next();
}
