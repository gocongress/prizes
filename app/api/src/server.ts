import * as serviceConfig from '@/config';
import { buildServiceContext } from '@/context';
import { defaultErrorHandler } from '@/lib/handlers';
import { buildOpenApiSpec } from '@/lib/openapi';
import { loadSeedData } from '@/lib/seed';
import {
  adminRoutes,
  authRoutes,
  awardPreferencesRoutes,
  prizesRoutes,
  usersRoutes,
} from '@/routes';
import type { Context } from '@/types';
import cookieParser from 'cookie-parser';
import express from 'express';
import { ServeStatic, createConfig, createServer, type Routing } from 'express-zod-api';
import { join } from 'node:path';
import ui from 'swagger-ui-express';

const serverConfig = (context: Context) =>
  createConfig({
    startupLogo: true,
    http: {
      listen: {
        port: Number(context.server.port),
        host: context.server.host,
      },
    },
    cors: ({ defaultHeaders, request }) => {
      // express-zod-api doesn't use explicit http header type
      const headers: Record<string, string> = {
        ...defaultHeaders,
        'Access-Control-Max-Age': '86400', // Cache preflight OPTIONS requests for 24hr
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      };

      const origin = request.headers.origin;
      if (origin && context.server.corsAllowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
      }

      return headers;
    },
    compression: true,
    logger: context.logger,
    errorHandler: defaultErrorHandler(context),
    beforeRouting: ({ app }) => {
      app.use(
        express.json({
          type: ['application/cloudevents+json', 'application/json'],
          limit: '1500kb',
        }),
      );
      app.use(cookieParser());
      // Route /docs to a SwaggerUI endpoint for improved developer experience
      app.use('/docs', ui.serve, ui.setup(null, { swaggerUrl: '/public/openapi.yaml' }));
    },
  });

const serverRouting = (context: Context) =>
  ({
    api: {
      v1: {
        auth: authRoutes(context),
        prizes: prizesRoutes(context),
        awardPreferences: awardPreferencesRoutes(context),
        users: usersRoutes(context),
        admin: adminRoutes(context),
      },
    },
    // path /public serves static files from /public
    public: new ServeStatic(join(__dirname, 'public'), {
      dotfiles: 'deny',
      index: false,
      redirect: false,
    }),
  }) as Routing;

export const buildServer = async () => {
  const context = buildServiceContext(serviceConfig);

  const config = serverConfig(context);
  const serverRoutes = serverRouting(context);

  if (process.env.SEED_DATA && process.env.SEED_DATA.toLowerCase() === 'true') {
    await loadSeedData(context);
  }

  await buildOpenApiSpec(serverRoutes, config, context);

  const server = await createServer(config, serverRoutes);
  return { server, context };
};
