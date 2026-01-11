import * as z from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE, MAX_PAGE_SIZE } from '@/lib/constants';

export const AwardPreferenceQueryFields = {
  id: 'id',
  playerId: 'player_id',
  awardId: 'award_id',
  preferenceOrder: 'preference_order',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const;
export type AwardPreferenceQueryField =
  (typeof AwardPreferenceQueryFields)[keyof typeof AwardPreferenceQueryFields];
export type AwardPreferenceQueryKey = keyof typeof AwardPreferenceQueryFields;
export const AwardPreferenceQueryKeys = Object.keys(AwardPreferenceQueryFields) as [
  AwardPreferenceQueryKey,
  ...AwardPreferenceQueryKey[],
];

export const AwardPreferenceDbSchema = z.object({
  id: z.guid(),
  player_id: z.guid(),
  award_id: z.guid(),
  prize_id: z.guid(),
  preference_order: z.number().int().positive(),
  created_at: z.date(),
  updated_at: z.date().nullish(),
});

export const AwardPreferenceApiSchema = z.object({
  id: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  kind: z.literal('awardPreference'),
  playerId: z.guid(),
  awardId: z.guid(),
  awardValue: z.number().nullish().optional(), // Data joined from awards table
  prizeId: z.guid(),
  preferenceOrder: z.number().int().positive(),
  createdAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  updatedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
});

export const AwardPreferenceListApiSchema = AwardPreferenceApiSchema.pick({
  id: true,
  kind: true,
  playerId: true,
  awardId: true,
  awardValue: true,
  prizeId: true,
  preferenceOrder: true,
  createdAt: true,
  updatedAt: true,
});

export const AwardPreferenceCreateSchema = AwardPreferenceApiSchema.pick({
  playerId: true,
  awardId: true,
  preferenceOrder: true,
});

export const AwardPreferenceUpdateSchema = AwardPreferenceApiSchema.pick({
  preferenceOrder: true,
});

export const AwardPreferenceDeleteSchema = z.object({
  message: z.string(),
});

export const AwardPreferenceQuerySchema = z.object({
  playerId: z.guid().nullable().optional(),
  awardId: z.guid().nullable().optional(),
  page: z.coerce.number().min(0).max(MAX_PAGE).default(0),
  pageSize: z.coerce.number().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  orderBy: z.enum(AwardPreferenceQueryKeys).default('preferenceOrder'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
});

export type AwardPreferenceDb = z.infer<typeof AwardPreferenceDbSchema>;
export type AwardPreferenceApi = z.infer<typeof AwardPreferenceApiSchema>;
export type CreateAwardPreference = z.infer<typeof AwardPreferenceCreateSchema>;
export type UpdateAwardPreference = z.infer<typeof AwardPreferenceUpdateSchema>;
export type DeleteAwardPreference = z.infer<typeof AwardPreferenceDeleteSchema>;
export type AwardPreferenceQueryParams = z.infer<typeof AwardPreferenceQuerySchema>;
