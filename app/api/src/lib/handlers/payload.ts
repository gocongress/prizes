import type { Context, ContextKind } from '@/types';
import { z, type ZodType } from 'zod';
import { ErrorPayloadSchema } from './schemas';
import type { ApiDataPayload, ApiErrorPayload, PaginatedQueryResults } from './types';

// Type guard to check if payload is a paginated result
const isPaginated = <M, F>(payload: any): payload is PaginatedQueryResults<M, F> =>
  Array.isArray(payload?.items);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataResponseSchema = <T extends ZodType<any>>(itemSchema: T) =>
  z.looseObject({
    data: z.union([
      itemSchema.transform(
        (data) => Object.fromEntries(Object.entries(data).filter(([_, value]) => value != null)), // Remove key/value where value is null or undefined
      ),
      z.object({
        orderBy: z.string().optional(),
        orderDirection: z.string().optional(),
        pageIndex: z.number().optional(),
        totalPages: z.number().optional(),
        itemsPerPage: z.number().optional(),
        totalItems: z.number().optional(),
        currentItemCount: z.number().optional(),
        items: z.array(
          itemSchema.transform(
            (data) =>
              Object.fromEntries(Object.entries(data).filter(([_, value]) => value != null)), // Remove key/value where value is null or undefined
          ),
        ),
      }),
    ]),
  });

/**
 * Builds a standardized API response from a single object or a paginated list.
 *
 * @param schema - Zod schema to validate items
 * @param context - Context containing API metadata (version and kind)
 * @param payload - Either a paginated list of items or a single item
 * @returns A validated API response object
 */
export const buildResponse = <T, M, F>(
  schema: ZodType<T>,
  context: Context,
  kind: ContextKind,
  payload: PaginatedQueryResults<M, F> | T,
): ApiDataPayload => {
  const data = isPaginated<M, F>(payload)
    ? {
        ...payload,
        items: payload.items.map((item) => ({
          kind,
          ...item,
        })),
      }
    : {
        ...payload,
        kind,
      };

  // Validate the inner data structure using the schema
  const dataSchema = DataResponseSchema(schema);
  let validatedData;
  try {
    validatedData = dataSchema.parse({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { token, ...request } = context.request ?? {};
      console.dir(
        {
          message:
            'Zod Validation Error in buildResponse, the output schema and data have a mismatch',
          kind,
          request,
          errors: error.format(), // express-zod-api seems to still have Zod v3 bits
        },
        { depth: null },
      );
      throw new Error('API response data failed validation, please contact support.');
    }
    throw error;
  }

  // Wrap with API metadata and validate full structure
  //return ApiPayloadSchema.parse({
  //  apiVersion: context.api.version,
  //  ...validatedData,
  //}) as ApiDataPayload;
  return {
    apiVersion: context.api.version,
    ...validatedData,
  } as ApiDataPayload;
};

export const buildErrorResponse = (payload: ApiErrorPayload) =>
  ErrorPayloadSchema.parse(payload) as ApiErrorPayload;

export const buildServerErrorResponse = (
  context: { api: { version: string } },
  message: string,
  code = 500,
): ApiErrorPayload =>
  buildErrorResponse({
    apiVersion: context.api.version,
    error: {
      code,
      message,
    },
  });
