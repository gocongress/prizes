import { type ZodTypeAny, z } from 'zod';
import {
  DEFAULT_ORDER_DIRECTION,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../constants';

const ErrorSchema = z.object({
  code: z.number().example(404).min(400).max(511),
  message: z.string(),
  errors: z
    .array(
      z.object({
        domain: z.string().nullish(),
        reason: z.string().nullish(),
        message: z.string().nullish(),
        location: z.string().nullish(),
        locationType: z.string().nullish(),
        extendedHelp: z.string().nullish(),
        sendReport: z.string().nullish(),
      }),
    )
    .nullish(),
});

export const createDataSchema = <T extends ZodTypeAny>(
  itemSchema: T,
  contextKinds: readonly [string, ...string[]],
) =>
  z.union([
    z.object({
      id: z.string().nullish(),
      kind: z.enum(contextKinds),
      fields: z.string().nullish(),
      etag: z.string().nullish(),
      lang: z.string().nullish(),
      updated: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
      deleted: z.boolean().nullish(),
      items: z.array(itemSchema).nullish().optional(),
    }),
    itemSchema,
  ]);

const DataSchema = z.looseObject({
  id: z.string().nullish(),
  kind: z.string().nullish(),
  fields: z.string().nullish(),
  etag: z.string().nullish(),
  lang: z.string().nullish(),
  updated: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  deleted: z.boolean().nullish(),
  items: z.array(z.record(z.string(), z.any())).nullish().optional(),
});

export const createSuccessPayloadSchema = <T extends ZodTypeAny>(
  itemSchema: T,
  contextKinds: readonly [string, ...string[]],
) =>
  z.strictObject({
    apiVersion: z.string(),
    context: z.string().nullish(),
    id: z.string().nullish(),
    method: z.string().nullish(),
    params: z.record(z.string(), z.string()).nullish(),
    data: createDataSchema(itemSchema, contextKinds),
  });

export const SuccessPayloadSchema = z.strictObject({
  apiVersion: z.string(),
  context: z.string().nullish(),
  id: z.string().nullish(),
  method: z.string().nullish(),
  params: z.record(z.string(), z.string()).nullish(),
  data: DataSchema,
});

export const ErrorPayloadSchema = z.strictObject({
  apiVersion: z.string(),
  context: z.string().nullish(),
  id: z.string().nullish(),
  method: z.string().nullish(),
  params: z.record(z.string(), z.string()).nullish(),
  error: ErrorSchema,
});

export const ApiPayloadSchema = z.union([SuccessPayloadSchema, ErrorPayloadSchema]);

export const UuidParamsSchema = z.object({ id: z.guid() });

export const QueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(DEFAULT_PAGE).optional(),
  pageSize: z.coerce.number().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE).optional(),
  orderDirection: z.enum(['asc', 'desc']).default(DEFAULT_ORDER_DIRECTION).optional(),
  ids: z
    .union([z.array(z.guid()), z.string().transform((val) => val.split(','))])
    .nullable()
    .optional(),
});

export const createQueryParamsSchema = (orderByFields: readonly [string, ...string[]]) =>
  QueryParamsSchema.extend({
    orderBy: z.enum(orderByFields).default('createdAt').optional(),
  });
