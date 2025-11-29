import type { EndpointOptions } from '@/lib/handlers/helpers';
import type { Context } from '@/types';
import { Middleware, type FlatObject } from 'express-zod-api';

export const RequestMiddleware = new Middleware<EndpointOptions<Context>, FlatObject, string>({
  handler: async ({ request, options: { context } }) => {
    const ctx = context;
    if (!ctx.request) {
      return {};
    }
    ctx.request.url = request.url;
    ctx.request.method = request.method;
    ctx.logger = ctx.logger.child({ url: request.url, method: request.method });
    return {};
  },
});
