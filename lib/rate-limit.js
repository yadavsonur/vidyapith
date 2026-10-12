const buckets = new Map();

export const rateLimit = ({ key, limit = 60, windowMs = 60_000 }) => {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (current.count >= limit) return { success: false, remaining: 0, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  current.count += 1;
  return { success: true, remaining: limit - current.count };
};

export const requestKey = (req, userId = "anonymous") => {
  const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  return `${userId}:${forwarded.split(",")[0].trim()}`;
};

export const assertRateLimit = (req, userId, options) => {
  const result = rateLimit({ key: requestKey(req, userId), ...options });
  if (!result.success) {
    const error = new Error("Too many requests");
    error.status = 429;
    error.retryAfter = result.retryAfter;
    throw error;
  }
  return result;
};
