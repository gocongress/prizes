import { featureFlags } from '@/config';
import { getUserJwt } from '@/lib/auth';
import { randomID } from '@/lib/crypto';
import { TABLE_NAME as PLAYERS_TABLE_NAME } from '@/models/player';
import {
  create,
  deleteById,
  find,
  getAll,
  getById,
  getProfile,
  updateById,
  TABLE_NAME as USERS_TABLE_NAME,
} from '@/models/user';
import {
  type CreateUser,
  type ImportUsers,
  type LoginUser,
  type UpdateUser,
  type UserApi,
  type UserQueryParams,
} from '@/schemas/user';
import type { Context, ServiceParams } from '@/types';
import createHttpError from 'http-errors';
import { type JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

export const getAllUser = async (args: {
  serviceParams: ServiceParams<void>;
  queryParams: UserQueryParams;
}) => {
  const context = args.serviceParams.context;
  const { items, ...rest } = await getAll(context, args.queryParams);
  context.logger.info({ ...rest });
  return { items, ...rest };
};

const getNewOneTimePass = async ({
  context,
  input,
}: ServiceParams<CreateUser>): Promise<UserApi> => {
  if (!input) {
    throw createHttpError(400, 'User email is missing.');
  }
  const user = await find(context, input.email);
  if (!user) {
    throw createHttpError(404, 'User invalid or not found.');
  }
  const trx = await context.db.transaction();
  try {
    const oneTimePass = randomID();
    const updatedUser = await updateById(context, trx, user.id, {
      one_time_passes: [oneTimePass],
    });
    if (!updatedUser) {
      throw createHttpError(404, 'User invalid or not found.');
    }
    await trx.commit();
    context.logger.debug(
      { userId: user.id, oneTimePass },
      'Generated new one-time password for user',
    );
    return updatedUser;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const createUser = async ({
  context,
  input,
}: ServiceParams<CreateUser>): Promise<UserApi> => {
  if (!input) {
    throw new Error('Create user input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const user = await create(context, trx, input);
    if (!user) {
      throw createHttpError(400, 'User create failed.');
    }
    await trx.commit();
    return user;
  } catch (error) {
    await trx.rollback();
    if (error instanceof Error && error.message.includes('users_lower_email_unique')) {
      if (!featureFlags.otp.issueNewCodeOnUserCreateEnabled) {
        const existingUser = await find(context, input.email);
        context.logger.info(
          { oneTimePass: existingUser?.oneTimePass },
          'User already exists with one-time passwords',
        );
        if (!existingUser) {
          throw createHttpError(400, 'User create failed.');
        }
        return existingUser;
      } else {
        context.logger.info('User already exists, generating new one-time password');
        return getNewOneTimePass({ context, input });
      }
    }
    throw error;
  }
};

export const loginUser = async ({ context, input }: ServiceParams<LoginUser>): Promise<UserApi> => {
  if (!input) {
    throw new Error('Login user input is missing.');
  }

  const user = await find(context, input.email, input.oneTimePass);
  if (!user) {
    throw createHttpError(400, 'Invalid email or one-time password.');
  }

  const trx = await context.db.transaction();
  try {
    let updatedUser: UserApi | undefined;
    if (context.runtime.adminEmails.includes(user.email)) {
      updatedUser = await updateById(context, trx, user.id, {
        last_login_at: new Date(),
        scope: 'ADMIN',
      });
    } else {
      updatedUser = await updateById(context, trx, user.id, { last_login_at: new Date() });
    }
    if (!updatedUser) {
      throw createHttpError(500, 'User update failed.');
    }

    updatedUser.token = getUserJwt(context, updatedUser);
    context.logger.debug(
      { userId: updatedUser.id, token: updatedUser.token, scope: updatedUser.scope },
      'User logged in successfully.',
    );
    await trx.commit();
    return updatedUser;
  } catch (error) {
    await trx.rollback();
    throw createHttpError(400, 'Error logging in, one-time password no longer valid.');
  }
};

export const getUserProfile = async ({
  context,
  input,
}: ServiceParams<UserApi['id']>): Promise<UserApi> => {
  if (!input) {
    throw createHttpError(400, 'User ID is missing.');
  }
  const user = await getProfile(context, input);
  if (!user) {
    throw createHttpError(404, 'User invalid or not found.');
  }
  return user;
};

export const getUserById = async ({
  context,
  input,
}: ServiceParams<UserApi['id']>): Promise<UserApi> => {
  if (!input) {
    throw createHttpError(400, 'User ID is missing.');
  }
  const user = await getById(context, input);
  if (!user) {
    throw createHttpError(404, 'User invalid or not found.');
  }
  return user;
};

export const updateUserById = async ({
  context,
  input,
}: ServiceParams<UpdateUser & { id: UserApi['id'] }>): Promise<UserApi> => {
  if (!input) {
    throw new Error('Update user input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const user = await updateById(context, trx, input.id, input);
    if (!user) {
      throw createHttpError(404, 'User invalid or not found.');
    }
    await trx.commit();
    return user;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const deleteUserById = async ({
  context,
  input,
}: ServiceParams<UserApi['id']>): Promise<UserApi> => {
  if (!input) {
    throw new Error('User ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const user = await deleteById(context, trx, input);
    if (!user) {
      throw createHttpError(404, 'User invalid or not found.');
    }
    await trx.commit();
    return user;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const getJwtUser = async (
  context: Context,
  payload: JwtPayload,
): Promise<{ user: UserApi }> => {
  if (!payload.sub) {
    context.logger.error(
      'JWT provided to user service is missing "sub" property intended to be the user.id',
    );
    throw new Error('Malformed JWT payload, unable to authenticate user.');
  }
  const user = await getUserById({ context, input: payload.sub });
  return { user };
};

export const bulkUpsertUsers = async (context: Context, input: ImportUsers): Promise<void> => {
  let userMap = new Map<string, string>(); // cache of email => users.id

  // Unique list of all provided email addresses
  const userEmails = [...new Set(input.users.map((u) => u.email.toLowerCase().trim()))];

  // Generate a big flat map of values: [id1, email1, pass1, id2, email2, pass2, ...]
  const userArgs = userEmails.flatMap((email) => [
    randomUUID(),
    email,
    JSON.stringify([randomID()]), // JSONB field
  ]);

  // Generate three parameters per email address: (?, ?, ?), (?, ?, ?), ...
  const userPlaceholders = userEmails.map((_, i) => `(?, ?, ?)`).join(', ');

  // SQL injection safe, fully-parameterized bulk insert.
  // On conflict (duplicate user found) notes:
  //  - Do not update/change the one_time_passes so that the original is kept.
  //  - Ensure a previously soft-deleted user is made active
  const userResults = await context.db.raw(
    `
    INSERT INTO ${USERS_TABLE_NAME} (id, email, one_time_passes)
    VALUES ${userPlaceholders}
    ON CONFLICT (LOWER(email))
    DO UPDATE SET
      email = EXCLUDED.email,
      deleted_at = null
    RETURNING id, email;
    `,
    userArgs,
  );

  const insertedUsers = userResults.rows;
  for (const u of insertedUsers) userMap.set(u.email, u.id);

  const playersProcessed: string[] = [];
  const playerValues = [];
  const playerArgs: (string | number)[] = [];

  // Deduplicate the player records unique by AGA ID.
  for (const row of input.users) {
    if (playersProcessed.includes(row.agaId)) {
      context.logger.info({ agaId: row.agaId }, 'Duplicate AGA ID in CSV, skipping this row.');
      continue;
    }
    const userId = userMap.get(row.email);
    if (!userId) {
      context.logger.error(
        { agaId: row.agaId },
        'AGA ID associated with an email that was not processed, skipping this row. ',
      );
      continue;
    }
    const id = randomUUID();
    // Generate a big flat map of values: [id1, userId1, agaId1, name1, rank1, id2, userId2, ...]
    playerArgs.push(id, userId, row.agaId, row.name, Number.parseFloat(row.rank.toString()));
    // Generate five parameters per aga id: (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), ...
    playerValues.push(`(?, ?, ?, ?, ?)`);
    playersProcessed.push(row.agaId);
  }

  if (playerValues.length) {
    // SQL injection safe, fully-parameterized bulk insert.
    // On conflict (duplicate player found) notes:
    //  - Update player details (change name, associate with different user, change rank)
    //  - Ensure a previously soft-deleted player is made active
    await context.db.raw(
      `
      INSERT INTO ${PLAYERS_TABLE_NAME} (id, user_id, aga_id, name, rank)
      VALUES ${playerValues.join(',')}
      ON CONFLICT (LOWER(aga_id))
      DO UPDATE SET
        aga_id = EXCLUDED.aga_id,
        user_id = EXCLUDED.user_id,
        name = EXCLUDED.name,
        rank = EXCLUDED.rank,
        deleted_at = null
      RETURNING id, aga_id;
    `,
      playerArgs,
    );
  }
};
