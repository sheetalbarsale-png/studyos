import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface SecurityStats {
  totalRequests: number;
  blockedAttacks: number;
  activeIpBans: number;
  rateLimitViolations: number;
  cacheHits: number;
  uptimeSeconds: number;
}

const startTime = Date.now();
let totalRequestsCount = 0;
let blockedAttacksCount = 0;
let rateLimitViolationsCount = 0;
let cacheHitsCount = 0;

// In-Memory IP Tracking for Rate Limiting & Brute Force Defense
interface IpRecord {
  count: number;
  firstRequestTime: number;
  failedAuthCount: number;
  lockedUntil: number;
  lastPenaltyMs: number;
}

const ipRegistry = new Map<string, IpRecord>();
const bannedIps = new Map<string, { bannedAt: number; reason: string; expiresAt: number }>();

// Clean up stale IP records every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRegistry.entries()) {
    if (now - record.firstRequestTime > 15 * 60 * 1000 && record.lockedUntil < now) {
      ipRegistry.delete(ip);
    }
  }
  for (const [ip, ban] of bannedIps.entries()) {
    if (ban.expiresAt < now) {
      bannedIps.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

// 1. TIMING-SAFE VERIFICATION
// Prevents side-channel timing analysis attacks
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Still execute timingSafeEqual on dummy buffer to normalize execution time
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// 2. INPUT SANITIZATION & INJECTION SHIELD
// Defends against SQL/NoSQL injections, prototype pollution, and XSS
export function sanitizeInput(obj: any): any {
  if (typeof obj === 'string') {
    // Strip script tags and dangerous HTML/SQL injection signatures
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/--\s*$/g, '')
      .replace(/union\s+select/gi, '[blocked]')
      .trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (typeof obj === 'object' && obj !== null) {
    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      // Block prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      clean[key] = sanitizeInput(obj[key]);
    }
    return clean;
  }
  return obj;
}

// 3. GLOBAL ANTI-DDOS & TRAFFIC SHAPING MIDDLEWARE
export function trafficGovernor(req: Request, res: Response, next: NextFunction) {
  totalRequestsCount++;
  const ip = getClientIp(req);
  const now = Date.now();

  // Check if IP is currently in the active ban list
  const activeBan = bannedIps.get(ip);
  if (activeBan) {
    if (now < activeBan.expiresAt) {
      blockedAttacksCount++;
      const remainingSecs = Math.ceil((activeBan.expiresAt - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `IP temporarily blocked due to malicious activity. Try again in ${remainingSecs}s.`,
        code: 'IP_BLOCKED',
        retryAfter: remainingSecs,
      });
    } else {
      bannedIps.delete(ip);
    }
  }

  // Get or init IP record
  let record = ipRegistry.get(ip);
  if (!record) {
    record = {
      count: 1,
      firstRequestTime: now,
      failedAuthCount: 0,
      lockedUntil: 0,
      lastPenaltyMs: 0,
    };
    ipRegistry.set(ip, record);
  } else {
    // Reset window every 60 seconds
    if (now - record.firstRequestTime > 60000) {
      record.count = 1;
      record.firstRequestTime = now;
    } else {
      record.count++;
    }
  }

  // Max 150 requests per minute per IP for general traffic
  if (record.count > 150) {
    rateLimitViolationsCount++;
    blockedAttacksCount++;
    return res.status(429).json({
      success: false,
      error: 'High traffic rate limit exceeded. Please throttle requests.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 60,
    });
  }

  // Sanitize body payload against prototype pollution and injections
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }

  // Add security headers to response
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Protected-By', 'bhaleinc-CyberShield-v3');

  next();
}

// 4. BRUTE FORCE AUTHENTICATION DEFENSE
export function recordFailedAuth(ip: string) {
  let record = ipRegistry.get(ip);
  const now = Date.now();
  if (!record) {
    record = {
      count: 1,
      firstRequestTime: now,
      failedAuthCount: 1,
      lockedUntil: 0,
      lastPenaltyMs: 1000,
    };
    ipRegistry.set(ip, record);
  } else {
    record.failedAuthCount++;
    // Exponential progressive penalty: 2s, 4s, 8s, 16s... up to 15-minute ban
    record.lastPenaltyMs = Math.min(record.lastPenaltyMs * 2 || 2000, 15 * 60 * 1000);
    record.lockedUntil = now + record.lastPenaltyMs;
  }

  // If 5 failed attempts in short succession, lock IP for 10 minutes
  if (record.failedAuthCount >= 5) {
    bannedIps.set(ip, {
      bannedAt: now,
      reason: 'Automated Brute-Force Password Guessing Detected',
      expiresAt: now + 10 * 60 * 1000,
    });
  }
}

export function recordSuccessfulAuth(ip: string) {
  const record = ipRegistry.get(ip);
  if (record) {
    record.failedAuthCount = 0;
    record.lockedUntil = 0;
  }
}

export function isAuthLocked(ip: string): { locked: boolean; remainingSecs: number } {
  const now = Date.now();
  const ban = bannedIps.get(ip);
  if (ban && now < ban.expiresAt) {
    return { locked: true, remainingSecs: Math.ceil((ban.expiresAt - now) / 1000) };
  }
  const record = ipRegistry.get(ip);
  if (record && record.lockedUntil > now) {
    return { locked: true, remainingSecs: Math.ceil((record.lockedUntil - now) / 1000) };
  }
  return { locked: false, remainingSecs: 0 };
}

// 5. CACHING ENGINE FOR HIGH TRAFFIC
// Avoids hammering Gemini API for identical requests
const responseCache = new Map<string, { data: any; expiresAt: number }>();

export function getCachedResponse(key: string): any | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  cacheHitsCount++;
  return cached.data;
}

export function setCachedResponse(key: string, data: any, ttlSeconds = 600) {
  responseCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  // Limit cache size to 1000 items
  if (responseCache.size > 1000) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
}

// 6. METRICS TELEMETRY
export function getSecurityStats(): SecurityStats {
  const now = Date.now();
  return {
    totalRequests: totalRequestsCount,
    blockedAttacks: blockedAttacksCount,
    activeIpBans: Array.from(bannedIps.values()).filter((b) => b.expiresAt > now).length,
    rateLimitViolations: rateLimitViolationsCount,
    cacheHits: cacheHitsCount,
    uptimeSeconds: Math.floor((now - startTime) / 1000),
  };
}
