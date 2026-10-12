import test from "node:test";
import assert from "node:assert/strict";
import { assertRateLimit } from "../lib/rate-limit.js";

test("rate limiter blocks after the configured threshold", () => {
  const key = `test-${Date.now()}-${Math.random()}`;
  const request = { headers: new Headers({ "x-forwarded-for": "127.0.0.1" }) };
  assert.doesNotThrow(() => assertRateLimit(request, key, { limit: 2, windowMs: 1000 }));
  assert.doesNotThrow(() => assertRateLimit(request, key, { limit: 2, windowMs: 1000 }));
  assert.throws(() => assertRateLimit(request, key, { limit: 2, windowMs: 1000 }), /Too many requests/);
});
