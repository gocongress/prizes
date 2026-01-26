import { DEFAULT_PAGE_SIZE, MAX_PAGE, MAX_PAGE_SIZE } from '@/lib/constants';
import * as z from 'zod';
import { EventApiSchema, EventMinimalDetailsSchema } from './event';

export const PlayerQueryFields = {
  id: 'id',
  userId: 'user_id',
  email: 'email',
  agaId: 'aga_id',
  rank: 'rank',
  name: 'name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const;
export type PlayerQueryField = (typeof PlayerQueryFields)[keyof typeof PlayerQueryFields];
export type PlayerQueryKey = keyof typeof PlayerQueryFields;
export const PlayerQueryKeys = Object.keys(PlayerQueryFields) as [
  PlayerQueryKey,
  ...PlayerQueryKey[],
];

export const PlayerDbSchema = z.object({
  id: z.guid(),
  user_id: z.guid(),
  aga_id: z.string(),
  rank: z.number().nullish(),
  name: z.string(),
  created_at: z.date(),
  deleted_at: z.date().nullish(),
  updated_at: z.date().nullish(),
});

export const PlayerApiSchema = z.object({
  id: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  kind: z.literal('player'),
  userId: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  agaId: z.string().example('12298'),
  rank: z.coerce.number().example(-2.1).optional(),
  name: z.string(),
  email: z.email().nullable().optional(), // Data joined from users table by user_id
  createdAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  deletedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  updatedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  events: z.array(EventApiSchema).optional(), // Nested events data when player is part of user profile query
});

export const PlayerCreateSchema = PlayerApiSchema.pick({
  userId: true,
  agaId: true,
  name: true,
  rank: true,
}).extend({
  email: z.email().optional(),
});

export const PlayerUpdateSchema = PlayerApiSchema.pick({
  userId: true,
  agaId: true,
  name: true,
  rank: true,
});

export const PlayerMinimalDetailsSchema = PlayerApiSchema.pick({
  id: true,
  userId: true,
  agaId: true,
  name: true,
  rank: true,
}).extend({
  events: z.array(EventMinimalDetailsSchema).optional(),
});

export const PlayerMessageSchema = z.object({
  message: z.string(),
});

export const PlayerQuerySchema = z.object({
  ids: z
    .union([z.array(z.guid()), z.string().transform((val) => val.split(','))])
    .nullable()
    .optional(),
  page: z.coerce.number().min(0).max(MAX_PAGE).default(0),
  pageSize: z.coerce
    .number()
    .min(1)
    .max(MAX_PAGE_SIZE * 10)
    .default(DEFAULT_PAGE_SIZE),
  orderBy: z.enum(PlayerQueryKeys).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
});

export type PlayerDb = z.infer<typeof PlayerDbSchema>;
export type PlayerApi = z.infer<typeof PlayerApiSchema>;
export type CreatePlayer = z.infer<typeof PlayerCreateSchema>;
export type UpdatePlayer = z.infer<typeof PlayerUpdateSchema>;
export type PlayerQueryParams = z.infer<typeof PlayerQuerySchema>;
