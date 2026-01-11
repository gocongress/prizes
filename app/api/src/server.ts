import * as serviceConfig from '@/config';
import { buildServiceContext } from '@/context';
import regfox from '@/handlers/webhooks/regfox';
import { defaultErrorHandler } from '@/lib/handlers';
import { buildOpenApiSpec } from '@/lib/openapi';
import { route } from '@/lib/routing-helpers';
import { loadSeedData } from '@/lib/seed';
import {
  adminRoutes,
  authRoutes,
  awardPreferencesRoutes,
  eventsRoutes,
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
      };

      const origin = request.headers.origin;
      if (origin && context.server.corsAllowedOrigins.includes(origin)) {
        headers['Access-Control-Max-Age'] = '86400'; // Cache preflight OPTIONS requests for 24hr
        headers['Access-Control-Allow-Headers'] =
          'Authorization,Content-Type,cf-turnstile-response';
        headers['Access-Control-Allow-Credentials'] = 'true';
        headers['Access-Control-Allow-Origin'] = origin;
      }

      return headers;
    },
    compression: true,
    logger: context.logger,
    errorHandler: defaultErrorHandler(context),
    beforeRouting: ({ app }) => {
      // @ts-ignore express-zod-api types do not include set method on app
      app.set('trust proxy', 1); // Trust first proxy when behind a proxy (e.g. Nginx)
      app.use(
        // Express5.x dropped rawBody which is necessary for webhook payload signature verification,
        // include rawBody to every request prior to parsing the body as json
        express.json({
          type: ['application/cloudevents+json', 'application/json'],
          limit: context.server.maxBodySize,
          verify: (req, res, buf) => {
            req.rawBody = buf;
          },
        }),
      );
      app.use(cookieParser());
      // Route /api/swagger to a SwaggerUI endpoint for improved developer experience
      app.use('/api/swagger', ui.serve, ui.setup(null, { swaggerUrl: '/api/doc/openapi.yaml' }));
    },
  });

const serverRouting = (context: Context) =>
  ({
    api: {
      v1: {
        auth: authRoutes(context),
        events: eventsRoutes(context),
        prizes: prizesRoutes(context),
        awardPreferences: awardPreferencesRoutes(context),
        users: usersRoutes(context),
        admin: adminRoutes(context),
      },
      // path /api/doc serves static files from /public
      doc: new ServeStatic(join(__dirname, 'public'), {
        dotfiles: 'deny',
        index: false,
        redirect: false,
      }),
    },
  }) as Routing;

const webhooksRouting = (context: Context) =>
  ({
    webhooks: {
      regfox: route({ get: regfox(context) }),
    },
  }) as Routing;

export const buildServer = async () => {
  const context = buildServiceContext(serviceConfig);

  const config = serverConfig(context);
  const serverRoutes = serverRouting(context);
  const webhooksRoutes = webhooksRouting(context);

  if (process.env.SEED_DATA && process.env.SEED_DATA.toLowerCase() === 'true') {
    await loadSeedData(context);
  }

  await buildOpenApiSpec(serverRoutes, config, context);

  const server = await createServer(config, { ...serverRoutes, ...webhooksRoutes });
  return { server, context };
};
