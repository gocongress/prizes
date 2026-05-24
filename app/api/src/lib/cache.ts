import type { Context } from '@/types';
import { Cacheable } from 'cacheable';
import type { NextFunction, Request, Response } from 'express';

// Create cacheable instance
const cache = new Cacheable();

// Clear all cached entries
export const resetCache = async () => {
  await cache.clear();
};

// Basic middleware
export const cacheMiddleware = (context: Context, ttl = 300000) => {
  // 5 minutes default
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();

    console.dir(context.request?.jwtPayload?.sub, { depth: null });
    const key = req.originalUrl;

    try {
      const cached = await cache.get(key);
      if (cached) {
        context.logger.info(`Cache hit for key: ${key}`);
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = ((body?: any) => {
        if (res.statusCode === 200) {
          cache.set(key, body, ttl).catch((err) => context.logger.error('Cache set error:', err));
          res.set('X-Cache', 'MISS');
        }
        return originalJson(body);
      }) as typeof res.json;

      next();
    } catch (error) {
      context.logger.error('Cache error:', error);
      next();
    }
  };
};
