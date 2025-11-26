import { DependsOnMethod } from 'express-zod-api';

/**
 * Creates a route with HTTP method handlers
 * @example route({ get: handler, post: handler })
 */
export const route = (handlers: Record<string, any>) => new DependsOnMethod(handlers);

/**
 * Creates a route with nested child routes
 * @example nested({}, { profile: route({ get: handler }) })
 */
export const nested = (handlers: Record<string, any>, children: Record<string, any>) =>
  new DependsOnMethod(handlers).nest(children);

/**
 * Creates standard CRUD routes for a resource
 * Generates routes: GET /, POST /, GET /:id, PUT /:id, PATCH /:id, DELETE /:id
 */
export const crud = (handlers: {
  getAll?: any;
  create?: any;
  getById?: any;
  update?: any;
  delete?: any;
}) =>
  nested(
    {
      ...(handlers.getAll && { get: handlers.getAll }),
      ...(handlers.create && { post: handlers.create }),
    },
    {
      ':id': route({
        ...(handlers.getById && { get: handlers.getById }),
        ...(handlers.update && { put: handlers.update, patch: handlers.update }),
        ...(handlers.delete && { delete: handlers.delete }),
      }),
    },
  );
