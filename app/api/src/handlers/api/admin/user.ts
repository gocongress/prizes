import { ScopeKinds } from '@/lib/constants';
import { ApiPayloadSchema, buildResponse, handlerFactory, UuidParamsSchema } from '@/lib/handlers';
import {
  UserApiSchema,
  UserCreateSchema,
  UserImportSchema,
  UserMessageSchema,
  UserMinimalDetailsSchema,
  UserQuerySchema,
  UserUpdateSchema,
  type UserQueryParams,
} from '@/schemas/user';
import * as UserService from '@/services/user';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';

/**
 * GET /api/v1/admin/users?page=2&pageSize=25
 */
export const getAllUser = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.USER,
    itemSchema: UserApiSchema,
    scopes: ScopeKinds.ADMIN,
    disableScrub: true,
  }).build({
    method: 'get',
    // input: createQueryParamsSchema(UserQueryKeys),
    input: UserQuerySchema,
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        const payload = await UserService.getAllUser({
          serviceParams: { context },
          queryParams: input as UserQueryParams,
        });
        return buildResponse(UserApiSchema, context, ContextKinds.USER, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error fetching users');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/users
 */
export const createUser = (context: Context) =>
  handlerFactory({
    authenticateUser: false,
    context,
    kind: ContextKinds.USER,
    itemSchema: UserMinimalDetailsSchema,
    scopes: ScopeKinds.USER,
    disableScrub: true,
  }).build({
    method: 'post',
    input: UserCreateSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await UserService.createUser({
          context,
          input,
          sendEmail: input.emailPasscode,
        });
        const { oneTimePass, ...rest } = payload;
        return buildResponse(UserMinimalDetailsSchema, context, ContextKinds.USER, {
          ...rest,
          isAdmin: payload.scope === 'ADMIN',
        });
      } catch (err) {
        context.logger.error({ err }, 'Error creating user');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/users/:id
 */
export const getUserById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.USER,
    itemSchema: UserApiSchema,
    scopes: ScopeKinds.ADMIN,
    disableScrub: true,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await UserService.getUserById({ context, input: input.id });
        return buildResponse(UserApiSchema, context, ContextKinds.USER, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error fetching user');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * PUT /api/v1/admin/users/:id
 */
export const updateUserById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.USER,
    itemSchema: UserApiSchema,
    scopes: ScopeKinds.ADMIN,
    disableScrub: true,
  }).build({
    method: ['put', 'patch'],
    input: UuidParamsSchema.extend(UserUpdateSchema.shape),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await UserService.updateUserById({ context, input });
        return buildResponse(UserApiSchema, context, ContextKinds.USER, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error updating user');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/admin/users/:id
 */
export const deleteUserById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.USER,
    itemSchema: UserMessageSchema,
    scopes: ScopeKinds.ADMIN,
    disableScrub: true,
  }).build({
    method: 'delete',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const rows = await UserService.deleteUserById({ context, input: input.id });
        return buildResponse(UserMessageSchema, context, ContextKinds.USER, {
          message: `${rows} users deleted.`,
        });
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error deleting user');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/users/import
 */
export const importUsers = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.USER,
    itemSchema: UserMessageSchema,
    scopes: ScopeKinds.ADMIN,
    disableScrub: true,
  }).build({
    method: 'post',
    input: UserImportSchema,
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        await UserService.bulkUpsertUsers(context, input);
        return buildResponse(UserMessageSchema, context, ContextKinds.USER, {
          message: 'Imported',
        });
      } catch (err) {
        context.logger.error({ err }, 'Error validating user import');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
