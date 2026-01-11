import * as z from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE, MAX_PAGE_SIZE } from '@/lib/constants';

export const ResultQueryFields = {
  id: 'id',
  eventId: 'event_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  allocationLockedAt: 'allocation_locked_at',
  allocationFinalizedAt: 'allocation_finalized_at',
} as const;
export type ResultQueryField = (typeof ResultQueryFields)[keyof typeof ResultQueryFields];
export type ResultQueryKey = keyof typeof ResultQueryFields;
export const ResultQueryKeys = Object.keys(ResultQueryFields) as [
  ResultQueryKey,
  ...ResultQueryKey[],
];

// Winner schema represents individual winner records in the JSONB array
export const WinnerSchema = z.object({
  division: z.string().min(1).trim(),
  agaId: z.string().min(1).trim(),
  place: z.coerce.number().int().positive(),
});

// Allocation kind enum
export const AllocationKind = {
  DEFAULT: 'DEFAULT',
  PREFERENCE: 'PREFERENCE',
  OVERRIDE: 'OVERRIDE',
} as const;

export const AllocationKindSchema = z.enum(['DEFAULT', 'PREFERENCE', 'OVERRIDE']);

// ResultAward schema represents award data stored in the awards JSONB column
export const ResultAwardSchema = z.object({
  playerId: z.guid(),
  playerName: z.string(),
  playerAgaId: z.string(),
  place: z.coerce.number().int().positive(),
  division: z.string().min(1).trim(),
  prizeTitle: z.string(),
  awardId: z.guid(),
  awardValue: z.coerce.number().nullable().optional(),
  awardRedeemCode: z.string().nullable().optional(),
  userEmail: z.email().nullable().optional(),
  awardAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  eventTitle: z.string(),
  awardPreferenceOrder: z.coerce.number().int().nullable().optional(),
  allocationKind: AllocationKindSchema.optional(),
});

export const ResultDbSchema = z.object({
  id: z.guid(),
  event_id: z.guid(),
  winners: z.string(), // Stored as JSON string in JSONB column
  awards: z.string(), // Stored as JSON string in JSONB column
  allocation_locked_at: z.date().nullish(),
  allocation_finalized_at: z.date().nullish(),
  created_at: z.date(),
  deleted_at: z.date().nullish(),
  updated_at: z.date().nullish(),
});

export const ResultApiSchema = z.object({
  id: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  kind: z.literal('result'),
  eventId: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  eventTitle: z.string().nullable().optional(),
  winners: z.array(WinnerSchema),
  awards: z.array(ResultAwardSchema).default([]),
  allocationLockedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  allocationFinalizedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  createdAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  deletedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  updatedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
});

// Has data object with fields appropriate for creating a new Result. ({ data }).
export const ResultCreateSchema = z.object({
  eventId: z.guid(),
  winners: z.array(WinnerSchema).default([]),
});

export const ResultUpdateSchema = z.object({
  winners: z.array(WinnerSchema),
});

export const ResultQuerySchema = z.object({
  page: z.coerce.number().min(0).max(MAX_PAGE).default(0),
  pageSize: z.coerce.number().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  orderBy: z.enum(ResultQueryKeys).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
});

// CSV Import Schema
export const ResultImportRowSchema = z.object({
  eventId: z.string().trim(),
  division: z.string().min(1).trim(),
  agaId: z.string().min(1).trim(),
  place: z.coerce.number().int().positive(),
});

export const ResultImportSchema = z.object({
  results: z.array(ResultImportRowSchema),
});

export const ResultImportApiSchema = z.object({
  message: z.string(),
});

// Schema for allocating awards with client modifications
// export const AllocateAwardsSchema = z.object({
//   awards: z.array(ResultAwardSchema),
// });
export const AllocateAwardsSchema = z.array(ResultAwardSchema);

// Schema for allocation recommendations response
export const AllocationRecommendationsSchema = z.object({
  recommendations: z.array(ResultAwardSchema),
  locked: z.boolean(),
  finalized: z.boolean(),
});

export type Winner = z.infer<typeof WinnerSchema>;
export type ResultAward = z.infer<typeof ResultAwardSchema>;
export type ResultDb = z.infer<typeof ResultDbSchema>;
export type ResultApi = z.infer<typeof ResultApiSchema>;
export type CreateResult = z.infer<typeof ResultCreateSchema>;
export type UpdateResult = z.infer<typeof ResultUpdateSchema>;
export type ResultQueryParams = z.infer<typeof ResultQuerySchema>;
export type ResultImportRow = z.infer<typeof ResultImportRowSchema>;
export type ImportResults = z.infer<typeof ResultImportSchema>;
export type AllocateAwards = z.infer<typeof AllocateAwardsSchema>;
export type AllocationRecommendations = z.infer<typeof AllocationRecommendationsSchema>;
