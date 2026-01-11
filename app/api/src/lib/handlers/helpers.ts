import { AuthMiddleware } from '@/middlewares/auth';
import { RequestMiddleware } from '@/middlewares/request';
import { TurnstileMiddleware } from '@/middlewares/turnstile';
import type { UserApi } from '@/schemas/user';
import { getJwtUser } from '@/services/user';
import type { Context, ContextKind } from '@/types';
import type { Response } from 'express';
import rateLimit from 'express-rate-limit';
import {
  EndpointsFactory,
  ensureHttpError,
  getMessageFromError,
  ResultHandler,
  type FlatObject,
} from 'express-zod-api';
import helmet from 'helmet';
import createHttpError from 'http-errors';
import { randomUUID } from 'node:crypto';
import { ZodError, type ZodTypeAny } from 'zod';
import {
  DEFAULT_ORDER_DIRECTION,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../constants';
import { randomID } from '../crypto';
import { buildServerErrorResponse } from './payload';
import { createSuccessPayloadSchema, ErrorPayloadSchema } from './schemas';
import type { QueryParams, ScopeKind } from './types';

export type EndpointOptions<C> = {
  context: C;
};

type HandlerParams = {
  error: Error | null;
  output: FlatObject | null;
  response: Response;
  options: FlatObject;
};

// A normalized version of query params, including computed values like offset and totalPages
type NormalizedQueryParams<F> = Required<QueryParams<F> & { offset: number; totalPages: number }>;

/**
 * Normalizes and validates query parameters for pagination and sorting.
 *
 * @param orderByFields - List of allowed fields to sort by
 * @param overrides - Raw query parameters passed in by the caller
 * @param totalItems - Total number of items available in the dataset
 * @param maxPageSize - Optional upper limit for page size (default: 100)
 * @returns Normalized and safe query parameters
 */
export const getQueryParams = <F>(
  orderByFields: readonly F[],
  overrides: QueryParams<F> = {},
  totalItems: number,
  maxPageSize = MAX_PAGE_SIZE,
): NormalizedQueryParams<F> => {
  const {
    page = DEFAULT_PAGE, // Default to page 1 if not provided
    pageSize = DEFAULT_PAGE_SIZE, // Default to 50 items per page
    orderDirection = DEFAULT_ORDER_DIRECTION, // Default sort direction is descending
    orderBy, // Optional field to sort by
  } = overrides;

  // Clamp pageSize between 1 and maxPageSize to prevent abuse
  const boundedPageSize = Math.max(1, Math.min(pageSize, maxPageSize));

  // Calculate total number of pages available
  const totalPages = Math.ceil(totalItems / boundedPageSize);

  // Clamp page number between 1 and totalPages to stay within bounds
  const safePage = Math.max(1, Math.min(page, totalPages));

  // Calculate the offset for pagination
  const offset = (safePage - 1) * boundedPageSize;

  // Validate orderBy field; fallback to the 'created_at' field
  const validOrderBy = orderBy && orderByFields.includes(orderBy) ? orderBy : ('createdAt' as F);

  return {
    page: safePage,
    pageSize: boundedPageSize,
    orderBy: validOrderBy,
    orderDirection,
    offset,
    totalPages,
  };
};

const setAuthCookie = (context: Context, response: Response, data: UserApi) => {
  if (data?.token && data?.kind === 'user') {
    response.cookie(context.server.cookieName, data.token, {
      httpOnly: true,
      secure: context.env === 'production',
      maxAge: context.server.cookieMaxAge,
      sameSite: 'lax',
      priority: 'high',
      domain: context.server.cookieDomain,
    });
  }
};

const clearAuthCookie = (context: Context, response: Response) => {
  response.clearCookie(context.server.cookieName, {
    httpOnly: true,
    secure: context.env === 'production',
    sameSite: 'lax',
    domain: context.server.cookieDomain,
  });
};

/**
 * Creates a result handler for API responses, supporting both success and error scenarios.
 *
 * @template T - The Zod schema type used to validate the success payload.
 * @template C - The context type for the endpoint options.
 *
 * @param kind - A string representing the kind of the API data response.
 * @param itemSchema - A Zod schema defining the structure of the success payload.
 *
 * @returns An instance of `ResultHandler` configured to handle API responses.
 *
 * ### Success Handling:
 * - The `positive` handler defines the schema and MIME type for successful responses.
 * - The success payload schema is created using `createSuccessPayloadSchema` with the provided `itemSchema` and `kind`.
 *
 * ### Error Handling:
 * - The `negative` handler defines the schema and MIME type for error responses.
 * - Errors are structured using the `ErrorPayloadSchema`.
 *
 * ### Handler Logic:
 * - If an error occurs:
 *   - The error is processed using `ensureHttpError` to extract the status code and exposure flag.
 *   - In production environments, sensitive error messages are scrubbed unless explicitly exposed.
 *   - The response includes the API version, error code, and error message.
 * - If no error occurs:
 *   - The response includes the standard API payload.
 *
 * ### Notes:
 * - Zod validation errors are aggregated into a single message for easier debugging.
 * - In production, unhandled errors are sanitized to prevent leaking sensitive information.
 * - Explicitly setting `expose: true` when throwing an error with `createHttpError` will include the error message in the response.
 */
const apiResultsHandler = <T extends ZodTypeAny, C>(
  kind: string,
  itemSchema: T,
  rawOutput = false,
  clearCookie = false,
) =>
  new ResultHandler({
    positive: () => {
      return {
        schema: createSuccessPayloadSchema(itemSchema, [kind]),
        mimeType: 'application/json',
      };
    },
    negative: () => ({
      schema: ErrorPayloadSchema,
      mimeType: 'application/json',
    }),
    handler: (params: HandlerParams) => {
      const { error, output, response, options } = params;
      const context = options.context as Context;

      try {
        if (error) {
          throw error;
        }

        // Clear auth cookie if clearCookie flag is set
        if (clearCookie) {
          clearAuthCookie(context, response);
        } else {
          // Set auth cookie if token is present
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setAuthCookie(context, response, (output as any).data);
        }

        if (rawOutput) {
          response.json(output);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          response.json({ id: context.request?.id, ...(output as any) });
        }
      } catch (err: unknown) {
        const error = err as Error;
        const { statusCode, expose } = ensureHttpError(error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shouldScrub = context.env === 'production' && !expose;
        let message = shouldScrub
          ? createHttpError(statusCode).message
          : getMessageFromError(error);
        if (err instanceof ZodError) {
          console.error(err);
          message = 'Server Error: Invalid response payload, contact support.';
        }
        return void response.status(statusCode).json({
          id: context.request?.id,
          ...buildServerErrorResponse(context, message, statusCode),
        });
      }
    },
  });

/**
 * Builds a standardized handler with common middleware and options.
 * @param kind - the context kind
 * @param context - the request context
 * @param itemSchema - A Zod schema defining the structure of the success payload.
 * @returns - a configured endpoint factory
 */
export const handlerFactory = <T extends ZodTypeAny>({
  kind,
  context,
  itemSchema,
  scopes,
  authenticateUser = true,
  useBotProtection = false,
  rawOutput = false,
  clearCookie = false,
}: {
  kind: ContextKind;
  context: Context;
  itemSchema: T;
  authenticateUser?: boolean;
  useBotProtection?: boolean;
  scopes: ScopeKind;
  rawOutput?: boolean;
  clearCookie?: boolean;
}) => {
  let handler = new EndpointsFactory(apiResultsHandler(kind, itemSchema, rawOutput, clearCookie))
    .addOptions(async () => {
      const requestId = randomID(8);
      const requestContext: Context = {
        ...context,
        request: {
          id: requestId,
          start: performance.now(),
        },
        logger: context.logger.child({ requestId }),
      };
      return {
        context: { ...requestContext },
        user: undefined,
      } as {
        context: Context;
        user?: UserApi;
      };
    })
    .addMiddleware(RequestMiddleware)
    .addExpressMiddleware(helmet());

  if (useBotProtection) {
    handler = handler.addMiddleware(TurnstileMiddleware);
  }

  if (authenticateUser) {
    handler = handler
      .use(
        // Rate limit authentication attempts to prevent brute-force attacks, do not limit successful requests
        rateLimit({
          windowMs: 1 * 60 * 1000, // 1 minute
          max: 5, // limit each IP to 5 failed requests per windowMs
          standardHeaders: 'draft-8',
          legacyHeaders: false,
          identifier: 'api-auth',
          skipSuccessfulRequests: true,
        }),
      )
      .addMiddleware(AuthMiddleware(getJwtUser, scopes));
  }

  return handler;
};

export const defaultErrorHandler = (context: Context) =>
  new ResultHandler({
    positive: () => ({
      schema: ErrorPayloadSchema,
      mimeType: 'application/json',
    }),
    negative: () => ({
      schema: ErrorPayloadSchema,
      mimeType: 'application/json',
    }),
    handler: ({ error, response, request }) => {
      console.error(error);
      context.logger.error(
        { url: request.url },
        `DefaultErrorHandler caught : ${error?.name} - ${error?.message}`,
      );
      const { statusCode } = ensureHttpError(error as Error);
      return void response.status(statusCode).json({
        id: randomUUID(),
        ...buildServerErrorResponse(
          { api: { version: '1.0' } },
          error?.message || 'Not found',
          statusCode,
        ),
      });
    },
  });
