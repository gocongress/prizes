import { runtime } from '@/config';
import { ScopeKindKeys } from '@/lib/handlers/constants';
import * as z from 'zod';
import { PlayerMinimalDetailsSchema } from './player';

export const UserQueryFields = {
  id: 'id',
  email: 'email',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  lastLoginAt: 'last_login_at',
  scope: 'scope',
} as const;
export type UserQueryField = (typeof UserQueryFields)[keyof typeof UserQueryFields];
export const UserQueryKeys = [
  'id',
  'email',
  'createdAt',
  'updatedAt',
  'lastLoginAt',
  'scope',
] as const;
export type UserQueryKey = keyof typeof UserQueryFields;

export const UserDbSchema = z.object({
  id: z.guid(),
  email: z.email(),
  one_time_passes: z.string(),
  created_at: z.date(),
  deleted_at: z.date().nullish(),
  updated_at: z.date().nullish(),
  last_login_at: z.date().nullish(),
  scope: z.enum(ScopeKindKeys).default('USER'),
});

export const UserApiSchema = z.object({
  id: z.guid().example('550e8400-e29b-41d4-a716-446655440000'),
  kind: z.literal('user'),
  email: z.email(),
  scope: z.enum(ScopeKindKeys).default('USER').example('USER'),
  createdAt: z.iso.datetime().example('2025-01-01T12:00:00.000Z'),
  deletedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  updatedAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  lastLoginAt: z.iso.datetime().nullish().example('2025-01-01T12:00:00.000Z'),
  token: z.jwt().optional().example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
  oneTimePass: z.array(z.string()).optional(),
  players: z.array(PlayerMinimalDetailsSchema).nullable().optional(),
});

export const UserCreateSchema = UserApiSchema.pick({
  email: true,
});

export const UserMinimalDetailsSchema = UserApiSchema.pick({
  id: true,
  email: true,
  token: true, // required by apiResultsHandler for setting auth cookie
  kind: true,
}).extend({
  isAdmin: z.boolean().default(false),
});

export const UserProfileSchema = UserApiSchema.pick({
  email: true,
  kind: true,
  players: true,
}).extend({
  isAdmin: z.boolean().default(false),
});

export const UserUpdateSchema = UserApiSchema.pick({ email: true, scope: true }).partial();

export const UserLoginSchema = UserCreateSchema.extend({
  oneTimePass: z.string().min(runtime.otpCodeLength).max(runtime.otpCodeLength),
});

export const UserMessageSchema = z.object({
  message: z.string(),
});

export const UserImportSchema = z.object({
  users: z.array(
    z.object({
      email: z.email(),
      agaId: z.string().example('12298'),
      name: z.string(),
      rank: z.coerce.number().example(-2.1),
    }),
  ),
});

export const UserQuerySchema = z.object({
  page: z.coerce.number().min(0).max(9999).default(0),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  orderBy: z.enum(UserQueryKeys).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
  q: z.string().optional().describe('Filter results by users email address.'),
});

export type UserDb = z.infer<typeof UserDbSchema>;
export type UserApi = z.infer<typeof UserApiSchema>;
export type CreateUser = z.infer<typeof UserCreateSchema>;
export type UpdateUser = z.infer<typeof UserUpdateSchema>;
export type ImportUsers = z.infer<typeof UserImportSchema>;
export type LoginUser = z.infer<typeof UserLoginSchema>;
export type UserQueryParams = z.infer<typeof UserQuerySchema>;
