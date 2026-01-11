import * as z from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE, MAX_PAGE_SIZE } from '@/lib/constants';

export const EventQueryFields = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  registrationUrl: 'registration_url',
  registrationFormId: 'registration_form_id',
  startAt: 'start_at',
  endAt: 'end_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const;
export type EventQueryField = (typeof EventQueryFields)[keyof typeof EventQueryFields];
export type EventQueryKey = keyof typeof EventQueryFields;
export const EventQueryKeys = Object.keys(EventQueryFields) as [EventQueryKey, ...EventQueryKey[]];

export const EventDbSchema = z.object({
  id: z.guid(),
  title: z.string().min(1).trim(),
  slug: z
    .string()
    .min(1)
    .trim()
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters (a-z), digits (0-9), and dashes (-)',
    ),
  description: z.string().nullish().optional(),
  registration_url: z.url().nullish().optional(),
  registration_form_id: z.string().nullish().optional(),
  start_at: z.date(),
  end_at: z.date(),
  created_at: z.date(),
  deleted_at: z.date().nullish(),
  updated_at: z.date().nullish(),
});

export const EventApiSchema = z.object({
  id: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  kind: z.literal('event'),
  title: z.string().min(1).trim(),
  slug: z
    .string()
    .min(1)
    .trim()
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters (a-z), digits (0-9), and dashes (-)',
    )
    .example('us-go-congress-2025'),
  description: z.string().trim().nullish().optional(),
  registrationUrl: z.url().nullish().optional(),
  registrationFormId: z.string().nullish().optional(),
  startAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  endAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  createdAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  deletedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  updatedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
});

export const EventSlugParamsSchema = z.object({
  slug: z
    .string()
    .min(1)
    .trim()
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters (a-z), digits (0-9), and dashes (-)',
    ),
});

export const EventMinimalDetailsSchema = EventApiSchema.pick({
  id: true,
  slug: true,
  title: true,
  startAt: true,
  endAt: true,
});

// Has data object with fields appropriate for creating a new Event. ({ data }).
export const EventCreateSchema = z.object({
  title: z.string().min(1).trim(),
  slug: z
    .string()
    .min(1)
    .trim()
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters (a-z), digits (0-9), and dashes (-)',
    )
    .example('us-go-congress-2025'),
  description: z.string().trim().nullish().optional(),
  registrationUrl: z.url().nullish().optional(),
  registrationFormId: z.string().nullish().optional(),
  startAt: z.iso.date().or(z.iso.datetime()).example('2025-01-01'),
  endAt: z.iso.date().or(z.iso.datetime()).example('2025-01-01'),
});

// Cannot update the slug of an event.
export const EventUpdateSchema = EventCreateSchema.pick({
  title: true,
  description: true,
  registrationUrl: true,
  registrationFormId: true,
  startAt: true,
  endAt: true,
});

export const EventQuerySchema = z.object({
  ids: z
    .union([z.array(z.guid()), z.string().transform((val) => val.split(','))])
    .nullable()
    .optional(),
  page: z.coerce.number().min(0).max(MAX_PAGE).default(0),
  pageSize: z.coerce.number().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  orderBy: z.enum(EventQueryKeys).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
});

export type EventDb = z.infer<typeof EventDbSchema>;
export type EventApi = z.infer<typeof EventApiSchema>;
export type CreateEvent = z.infer<typeof EventCreateSchema>;
export type UpdateEvent = z.infer<typeof EventUpdateSchema>;
export type EventQueryParams = z.infer<typeof EventQuerySchema>;
