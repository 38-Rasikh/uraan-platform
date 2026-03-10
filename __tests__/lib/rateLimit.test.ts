import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { checkRateLimit } from '@/lib/rateLimit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    // Reset module to clear the internal Map between tests
    vi.resetModules()
  })

  it('allows requests within the limit', () => {
    const result = checkRateLimit('test-key-1', 5, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('tracks consecutive requests and decrements remaining', () => {
    checkRateLimit('test-key-2', 3, 60_000)
    checkRateLimit('test-key-2', 3, 60_000)
    const third = checkRateLimit('test-key-2', 3, 60_000)
    expect(third.allowed).toBe(true)
    expect(third.remaining).toBe(0)
  })

  it('blocks the request when the limit is exceeded', () => {
    checkRateLimit('test-key-3', 2, 60_000)
    checkRateLimit('test-key-3', 2, 60_000)
    const blocked = checkRateLimit('test-key-3', 2, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('uses separate counters for different keys', () => {
    checkRateLimit('ip-a', 1, 60_000)
    const blocked = checkRateLimit('ip-a', 1, 60_000)
    const fresh = checkRateLimit('ip-b', 1, 60_000)

    expect(blocked.allowed).toBe(false)
    expect(fresh.allowed).toBe(true)
  })

  it('resets the counter after the window expires', () => {
    checkRateLimit('test-key-4', 1, 1_000)
    const blocked = checkRateLimit('test-key-4', 1, 1_000)
    expect(blocked.allowed).toBe(false)

    // Advance past the window
    vi.advanceTimersByTime(1_001)

    const allowed = checkRateLimit('test-key-4', 1, 1_000)
    expect(allowed.allowed).toBe(true)
    expect(allowed.remaining).toBe(0)
  })

  it('returns a resetAt timestamp in the future', () => {
    const now = Date.now()
    const result = checkRateLimit('test-key-5', 5, 30_000)
    expect(result.resetAt).toBeGreaterThan(now)
    expect(result.resetAt).toBeLessThanOrEqual(now + 30_000)
  })
})
