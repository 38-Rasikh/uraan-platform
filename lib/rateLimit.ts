/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Suitable for single-instance (Vercel serverless) deployments.
 * Each Lambda invocation has its own memory, so the effective limit is
 * "N requests per window per instance" — which is still a meaningful
 * protection against automated brute-force from a single IP on a warm
 * function instance.
 *
 * For multi-instance / high-traffic production, swap the store for
 * an Upstash Redis client (same interface, just replace Map with KV).
 */

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Purge expired entries periodically to prevent unbounded memory growth.
// setInterval is available in Node.js runtimes; safe to skip in Edge runtime.
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now()
      for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) store.delete(key)
      }
    },
    5 * 60 * 1_000
  )
}

export interface RateLimitResult {
  allowed: boolean
  /** Remaining requests in the current window */
  remaining: number
  /** Unix timestamp (ms) when the window resets */
  resetAt: number
}

/**
 * Check whether `key` is within the rate limit.
 * Mutates internal state — call once per request.
 *
 * @param key      Unique identifier, e.g. `"login:1.2.3.4"`
 * @param limit    Max allowed requests per window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
