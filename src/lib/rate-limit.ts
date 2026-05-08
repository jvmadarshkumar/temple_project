interface RateLimitInfo {
  count: number;
  lastReset: number;
}

const rateLimitCache = new Map<string, RateLimitInfo>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const info = rateLimitCache.get(ip) || { count: 0, lastReset: now };

  // Reset the count if the time window has passed
  if (now - info.lastReset > windowMs) {
    info.count = 0;
    info.lastReset = now;
  }

  // Increment the request count
  info.count += 1;
  rateLimitCache.set(ip, info);

  // Return false if the limit is exceeded, true otherwise
  if (info.count > limit) {
    return false;
  }
  return true;
}
