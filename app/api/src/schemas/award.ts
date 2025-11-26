import * as z from 'zod';

export const AwardQueryFields = {
  id: 'id',
  prizeId: 'prize_id',
  prizeTitle: 'prizeTitle',
  playerId: 'player_id',
  playerName: 'playerName',
  redeemCode: 'redeem_code',
  value: 'value',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const;
export type AwardQueryField = (typeof AwardQueryFields)[keyof typeof AwardQueryFields];
export type AwardQueryKey = keyof typeof AwardQueryFields;
export const AwardQueryKeys = Object.keys(AwardQueryFields) as [AwardQueryKey, ...AwardQueryKey[]];

export const AwardDbSchema = z.object({
  id: z.guid(),
  prize_id: z.guid().nullable().optional(),
  player_id: z.guid().nullable().optional(),
  redeem_code: z.string().nullable().optional(),
  value: z.number().nullish(),
  created_at: z.date(),
  updated_at: z.date().nullish(),
});

export const AwardApiSchema = z.object({
  id: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  kind: z.literal('award'),
  redeemCode: z.string().trim().nullable().optional(),
  value: z.number().nullish(),
  prizeId: z.guid().nullable().optional(),
  prizeTitle: z.string().nullable().optional(),
  playerId: z.guid().nullable().optional(),
  playerName: z.string().nullable().optional(),
  createdAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  updatedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  available: z.boolean().optional().default(true), // Award has been assigned to a player - derived by playerId being null or not
});

export const AwardListApiSchema = AwardApiSchema.pick({
  id: true,
  kind: true,
  value: true,
  redeemCode: true,
  prizeId: true,
  prizeTitle: true,
  playerId: true,
  playerName: true,
  createdAt: true,
  updatedAt: true,
  available: true,
});

// Has data object with fields appropriate for creating a new Award. ({ data }).
export const AwardCreateSchema = AwardApiSchema.pick({
  redeemCode: true,
  prizeId: true,
  playerId: true,
  value: true,
});

export const AwardUpdateSchema = AwardApiSchema.pick({
  redeemCode: true,
  playerId: true,
  value: true,
});

export const AwardDeleteSchema = z.object({
  message: z.string(),
});

export const AwardQuerySchema = z.object({
  prize_id: z.guid().nullable().optional(),
  page: z.coerce.number().min(0).max(9999).default(0),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  orderBy: z.enum(AwardQueryKeys).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
});

// Schema for user awards with prize data
export const AwardWithPrizeApiSchema = AwardApiSchema.pick({
  id: true,
  kind: true,
  value: true,
  redeemCode: true,
  updatedAt: true,
}).extend({
  prize: z
    .object({
      id: z.guid(),
      kind: z.literal('prize'),
      title: z.string(),
      description: z.string().nullish().optional(),
      url: z.string().nullish().optional(),
      recommendedRank: z.string().optional(),
      eventId: z.guid().nullable().optional(),
      eventTitle: z.string().nullable().optional(),
      imageType: z.string().nullish().optional(),
      imageThumbnailEncoded: z.base64().nullish().optional(),
    })
    .nullable()
    .optional(),
});

export const AwardWithPrizeListApiSchema = z.object({ items: z.array(AwardWithPrizeApiSchema) });

export type AwardDb = z.infer<typeof AwardDbSchema>;
export type AwardApi = z.infer<typeof AwardApiSchema>;
export type CreateAward = z.infer<typeof AwardCreateSchema>;
export type UpdateAward = z.infer<typeof AwardUpdateSchema>;
export type DeleteAward = z.infer<typeof AwardDeleteSchema>;
export type AwardQueryParams = z.infer<typeof AwardQuerySchema>;
export type AwardWithPrizeApi = z.infer<typeof AwardWithPrizeApiSchema>;
