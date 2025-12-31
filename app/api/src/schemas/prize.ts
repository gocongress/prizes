import * as z from 'zod';
import { AwardApiSchema, AwardCreateSchema } from './award';

export const RecommendedRanks = ['ALL', 'DAN', 'SDK', 'DDK'] as const;
export const PrizeQueryFields = {
  id: 'id',
  eventId: 'event_id',
  title: 'title',
  eventTitle: 'eventTitle',
  description: 'description',
  recommendedRank: 'recommended_rank',
  url: 'url',
  contact: 'contact',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  imageType: 'image_type',
} as const;
export type PrizeQueryField = (typeof PrizeQueryFields)[keyof typeof PrizeQueryFields];
export const PrizeQueryKeys = [
  'id',
  'eventId',
  'title',
  'eventTitle',
  'description',
  'recommendedRank',
  'url',
  'contact',
  'createdAt',
  'updatedAt',
  'imageType',
] as const;
export type PrizeQueryKey = keyof typeof PrizeQueryFields;

export const PrizeDbSchema = z.object({
  id: z.guid(),
  title: z.string().min(1).trim(),
  event_id: z.guid(),
  description: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
  value: z.number().optional(),
  recommended_rank: z.enum(RecommendedRanks).default('ALL'),
  image: z.any().nullable().optional(), // BYTEA field is returned as a Buffer
  image_thumbnail: z.any().nullable().optional(), // BYTEA field is returned as a Buffer
  image_type: z.string().nullable().optional(),
  created_at: z.date(),
  deleted_at: z.date().nullish(),
  updated_at: z.date().nullish(),
});

export const PrizeApiSchema = z.object({
  id: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  kind: z.literal('prize'),
  title: z.string().min(1).trim(),
  description: z.string().trim().nullish().optional(),
  url: z.string().trim().nullish().optional(),
  contact: z.string().trim().nullish().optional(),
  recommendedRank: z.enum(RecommendedRanks).default('ALL'),
  eventId: z.guid(),
  eventTitle: z.string().nullable().optional(), // Field joined from events table by event_id
  createdAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  deletedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  updatedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  awardsCount: z.number().optional(), // Related awards record count
  awardsSum: z.number().optional(), // Related awards sum of value field
  awards: z.array(AwardApiSchema).optional(), // Related awards records
  imageType: z.string().nullish().optional().example('image/png'),
  imageThumbnailEncoded: z.base64().nullish().optional(),
  imageEncoded: z.base64().nullish().optional(),
});

export const PrizeListApiSchema = PrizeApiSchema.pick({
  id: true,
  kind: true,
  title: true,
  eventTitle: true,
  description: true,
  url: true,
  contact: true,
  recommendedRank: true,
  eventId: true,
  awardsCount: true,
  awardsSum: true,
  awards: true,
  imageType: true,
  imageThumbnailEncoded: true,
  createdAt: true,
  deletedAt: true,
  updatedAt: true,
});

export const PrizeListUserApiSchema = PrizeApiSchema.extend({
  awards: z
    .array(
      AwardApiSchema.pick({
        id: true,
        kind: true,
        value: true,
        available: true,
      }),
    )
    .optional(),
}).pick({
  id: true,
  kind: true,
  title: true,
  eventTitle: true,
  description: true,
  url: true,
  recommendedRank: true,
  eventId: true,
  awards: true,
  awardsCount: true,
  imageType: true,
  imageThumbnailEncoded: true,
});

export const PrizeUserApiSchema = PrizeApiSchema.extend({
  awards: z
    .array(
      AwardApiSchema.pick({
        id: true,
        kind: true,
        value: true,
        available: true,
      }),
    )
    .optional(),
}).pick({
  id: true,
  kind: true,
  title: true,
  eventTitle: true,
  description: true,
  url: true,
  recommendedRank: true,
  eventId: true,
  awards: true,
  awardsCount: true,
  imageType: true,
  imageThumbnailEncoded: true,
});

// Has data object with fields appropriate for creating a new Prize. ({ data }).
export const PrizeCreateSchema = PrizeApiSchema.extend({
  awards: z.array(AwardCreateSchema.extend({ id: z.guid().nullable().optional() })),
}).pick({
  title: true,
  description: true,
  url: true,
  contact: true,
  recommendedRank: true,
  imageEncoded: true,
  imageThumbnailEncoded: true,
  imageType: true,
  eventId: true,
  awards: true,
});

export const PrizeUpdateSchema = PrizeCreateSchema;

export const PrizeQuerySchema = z.object({
  page: z.coerce.number().min(0).max(9999).default(0),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  orderBy: z.enum(PrizeQueryKeys).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
  q: z.string().optional().describe('Filter results.'),
});

export type PrizeDb = z.infer<typeof PrizeDbSchema>;
export type PrizeApi = z.infer<typeof PrizeApiSchema>;
export type CreatePrize = z.infer<typeof PrizeCreateSchema>;
export type UpdatePrize = z.infer<typeof PrizeUpdateSchema>;
export type PrizeQueryParams = z.infer<typeof PrizeQuerySchema>;
