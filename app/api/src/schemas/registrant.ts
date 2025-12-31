import * as z from 'zod';

export const RegistrantQueryFields = {
  id: 'id',
  playerId: 'player_id',
  playerName: 'playerName',
  eventId: 'event_id',
  eventTitle: 'eventTitle',
  registrationDate: 'registration_date',
  status: 'status',
  notes: 'notes',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const;
export type RegistrantQueryField =
  (typeof RegistrantQueryFields)[keyof typeof RegistrantQueryFields];
export type RegistrantQueryKey = keyof typeof RegistrantQueryFields;
export const RegistrantQueryKeys = Object.keys(RegistrantQueryFields) as [
  RegistrantQueryKey,
  ...RegistrantQueryKey[],
];

export const RegistrantDbSchema = z.object({
  id: z.guid(),
  player_id: z.guid(),
  event_id: z.guid(),
  registration_date: z.date(),
  status: z.string().nullish(),
  notes: z.string().nullish(),
  created_at: z.date(),
  deleted_at: z.date().nullish(),
  updated_at: z.date().nullish(),
});

export const RegistrantApiSchema = z.object({
  id: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  kind: z.literal('registrant'),
  playerId: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  playerName: z.string().optional(),
  eventId: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  eventTitle: z.string().optional(),
  registrationDate: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  status: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  deletedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  updatedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
});

export const RegistrantCreateSchema = RegistrantApiSchema.pick({
  playerId: true,
  eventId: true,
  status: true,
  notes: true,
}).extend({
  registrationDate: z.iso.date().or(z.iso.datetime()).example('2025-01-01'),
});

export const RegistrantUpdateSchema = RegistrantApiSchema.pick({
  status: true,
  notes: true,
}).extend({
  registrationDate: z.iso.date().or(z.iso.datetime()).example('2025-01-01'),
});

export const RegistrantMessageSchema = z.object({
  message: z.string(),
});

export const RegistrantQuerySchema = z.object({
  page: z.coerce.number().min(0).max(9999).default(0),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  orderBy: z.enum(RegistrantQueryKeys).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
});

export type RegistrantDb = z.infer<typeof RegistrantDbSchema>;
export type RegistrantApi = z.infer<typeof RegistrantApiSchema>;
export type CreateRegistrant = z.infer<typeof RegistrantCreateSchema>;
export type UpdateRegistrant = z.infer<typeof RegistrantUpdateSchema>;
export type RegistrantQueryParams = z.infer<typeof RegistrantQuerySchema>;
