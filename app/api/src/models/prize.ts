import { getQueryParams } from '@/lib/handlers';
import type { AwardApi, AwardDb } from '@/schemas/award';
import type { EventDb } from '@/schemas/event';
import {
  PrizeQueryFields,
  PrizeQueryKeys,
  type CreatePrize,
  type PrizeApi,
  type PrizeDb,
  type PrizeQueryKey,
  type PrizeQueryParams,
  type UpdatePrize,
} from '@/schemas/prize';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';
import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import {
  TABLE_NAME as AWARD_TABLE_NAME,
  create as createAward,
  updateById as updateAward,
} from './award';
import { TABLE_NAME as EVENT_TABLE_NAME } from './event';

export const TABLE_NAME = 'prizes';

type PrizeWithAwards = PrizeDb & {
  eventTitle?: EventDb['title'];
  playerAwards?: AwardDb[];
  playerAwardsCount?: number;
  playerAwardsSum?: number;
};

/**
 * Postgres query with case-insensitive contains-subquery (ILIKE) to capture the prize, its event title and an array of related award records;
 * ie. { id, title, value, ..., eventTitle, playerAwards[], playerAwardsCount, playerAwardsSum }
 */
const prizeWithAwardsQuery = (context: Context, queryParams?: PrizeQueryParams) => {
  const query = context
    .db<PrizeDb>(TABLE_NAME)
    .select(
      `${TABLE_NAME}.*`,
      `${EVENT_TABLE_NAME}.title as eventTitle`,
      context.db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id',           ${AWARD_TABLE_NAME}.id,
              'player_id',    ${AWARD_TABLE_NAME}.player_id,
              'prize_id',     ${AWARD_TABLE_NAME}.prize_id,
              'redeem_code',  ${AWARD_TABLE_NAME}.redeem_code,
              'value',        ${AWARD_TABLE_NAME}.value,
              'created_at',   ${AWARD_TABLE_NAME}.created_at,
              'updated_at',   ${AWARD_TABLE_NAME}.updated_at
            )
          ) FILTER (WHERE ${AWARD_TABLE_NAME}.id IS NOT NULL), '[]'::json
        ) as "playerAwards",
        CAST(COUNT(${AWARD_TABLE_NAME}.id) FILTER (WHERE ${AWARD_TABLE_NAME}.id IS NOT NULL) AS INTEGER) AS "playerAwardsCount",
        COALESCE(
          SUM(${AWARD_TABLE_NAME}.value) FILTER (WHERE ${AWARD_TABLE_NAME}.id IS NOT NULL),
          0
        ) AS "playerAwardsSum"
      `),
    )
    .leftJoin(EVENT_TABLE_NAME, `${TABLE_NAME}.event_id`, `${EVENT_TABLE_NAME}.id`)
    .leftJoin(AWARD_TABLE_NAME, `${TABLE_NAME}.id`, `${AWARD_TABLE_NAME}.prize_id`)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .groupBy(`${TABLE_NAME}.id`, `${EVENT_TABLE_NAME}.title`);

  if (queryParams?.q) {
    query.andWhere((subQuery) => {
      subQuery
        .whereILike(`${TABLE_NAME}.title`, `%${queryParams.q}%`)
        .orWhereILike(`${TABLE_NAME}.description`, `%${queryParams.q}%`)
        .orWhereILike(`${EVENT_TABLE_NAME}.title`, `%${queryParams.q}%`);
    });
  }

  return query;
};

const asModel = (item: PrizeWithAwards): PrizeApi => {
  return {
    id: item.id,
    kind: ContextKinds.PRIZE,
    title: item.title,
    description: item.description,
    url: item.url,
    contact: item.contact,
    sponsor: item.sponsor,
    recommendedRank: item.recommended_rank,
    eventId: item.event_id,
    eventTitle: item.eventTitle,
    createdAt: item.created_at.toISOString(),
    deletedAt: item.deleted_at?.toISOString(),
    updatedAt: item.updated_at?.toISOString(),
    imageEncoded: item.image?.toString('base64'),
    imageThumbnailEncoded: item.image_thumbnail?.toString('base64'),
    imageType: item.image_type,
    awardsCount: item.playerAwardsCount,
    awardsSum: item.playerAwardsSum,
    awards: item.playerAwards?.map(
      (a) =>
        ({
          createdAt: new Date(a.created_at.toString()).toISOString(),
          id: a.id,
          kind: ContextKinds.AWARD,
          redeemCode: a.redeem_code,
          playerId: a.player_id,
          prizeId: a.prize_id,
          updatedAt: a.updated_at ? new Date(a.updated_at).toISOString() : undefined,
          value: a.value,
          available: !Boolean(a.player_id),
        }) satisfies AwardApi,
    ),
  } satisfies PrizeApi;
};

export const getAll = async (
  context: Context,
  queryParams: PrizeQueryParams,
): Promise<{
  orderBy: PrizeQueryKey;
  orderDirection: 'asc' | 'desc';
  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentItemCount: number;
  items: PrizeApi[];
}> => {
  const countRows = await prizeWithAwardsQuery(context, queryParams);
  const totalItems = countRows.length;
  const { page, pageSize, orderBy, orderDirection, offset, totalPages } =
    getQueryParams<PrizeQueryKey>(PrizeQueryKeys, queryParams, totalItems);

  // Improve this if future table-joined fields are include in the orderBy
  const orderByTable =
    orderBy === 'eventTitle'
      ? `${EVENT_TABLE_NAME}.title`
      : `${TABLE_NAME}.${PrizeQueryFields[orderBy]}`;

  const rows: PrizeWithAwards[] = await prizeWithAwardsQuery(context, queryParams)
    .orderBy(orderByTable, orderDirection)
    .offset(offset)
    .limit(pageSize);

  return {
    orderBy,
    orderDirection,
    pageIndex: page,
    totalPages: totalPages,
    itemsPerPage: pageSize,
    totalItems,
    currentItemCount: rows.length,
    items: rows.map(asModel),
  };
};

export const getById = async (context: Context, id: PrizeApi['id']): Promise<PrizeApi> => {
  const rows: PrizeWithAwards[] = await prizeWithAwardsQuery(context)
    .where(`${TABLE_NAME}.id`, id)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .groupBy(`${TABLE_NAME}.id`, `${EVENT_TABLE_NAME}.title`);

  if (!rows.length) {
    throw createHttpError(404, `Prize ${id} not found.`);
  }

  return asModel(rows[0]);
};

export const create = async (
  context: Context,
  trx: Knex.Transaction,
  input: Partial<CreatePrize>,
): Promise<PrizeApi> => {
  const image = input.imageEncoded ? Buffer.from(input.imageEncoded, 'base64') : undefined;
  let image_thumbnail;
  if (image) {
    const sharpInstance = sharp(image).resize(100, 100, { fit: 'inside' });
    image_thumbnail = await sharpInstance.toBuffer();
  }

  const rows = await trx<PrizeDb>(TABLE_NAME)
    .insert({
      id: randomUUID(),
      title: input.title,
      description: input.description ?? undefined,
      url: input.url ?? undefined,
      contact: input.contact ?? undefined,
      sponsor: input.sponsor ?? undefined,
      recommended_rank: input.recommendedRank,
      event_id: input.eventId ?? undefined,
      image,
      image_thumbnail,
      image_type: input.imageType,
      created_at: new Date(),
    })
    .returning<PrizeDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, 'Created Prize not returned.');
  }

  let playerAwards: AwardApi[] = [];
  if (input.awards) {
    const createdAwards = await Promise.all(
      input.awards.map((a) => createAward(context, trx, { ...a, prizeId: rows[0].id })),
    );
    playerAwards = createdAwards.filter(Boolean) as AwardApi[];
  }

  return { ...asModel(rows[0]), awards: playerAwards, awardsCount: playerAwards?.length };
};

export const updateById = async (
  context: Context,
  trx: Knex.Transaction,
  id: PrizeApi['id'],
  input: Partial<UpdatePrize>,
): Promise<PrizeApi> => {
  const prize = await getById(context, id);
  const {
    title,
    description,
    url,
    contact,
    sponsor,
    recommendedRank,
    imageEncoded,
    imageType,
    eventId,
  } = input;

  const updateFields: Partial<PrizeDb> = {
    title: title ?? prize.title,
    description,
    url,
    contact,
    sponsor,
    recommended_rank: recommendedRank ?? prize.recommendedRank,
    event_id: eventId,
    updated_at: new Date(),
  };

  // If an image is included, generate a thumbnail for it and include details in the update.
  if (imageEncoded) {
    updateFields.image = Buffer.from(imageEncoded, 'base64');
    updateFields.image_type = imageType ?? prize.imageType ?? null;
    let image_thumbnail;
    if (updateFields.image) {
      const sharpInstance = sharp(updateFields.image).resize(100, 100, { fit: 'inside' });
      image_thumbnail = await sharpInstance.toBuffer();
      updateFields.image_thumbnail = image_thumbnail;
    }
  }

  // Update the Prize
  const rows = await trx<PrizeDb>(TABLE_NAME)
    .where({ id })
    .update(updateFields)
    .returning<PrizeDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, `Updated Prize ${id} not returned.`);
  }

  /**
   * Admin UI includes all award records related to the Prize. Sync the Awards records
   * with the provded awards during update.
   * - New Awards will have an undefined id
   * - Existing Awards will have its id included
   * - Delete Awards will not be included in the awards array
   *
   * Find all existing (not new) Awards included in the awards array, delete any Awards records in the database
   * related to this Prize which were not found in the array. If the awards array is empty, delete all Awards records
   * currently related to this Prize.
   */
  const updatingAwards = input.awards?.map((a) => a.id).filter(Boolean);
  if (updatingAwards && updatingAwards.length > 0) {
    await trx<AwardDb>(AWARD_TABLE_NAME)
      .whereNotIn('id', updatingAwards as string[])
      .andWhere({ prize_id: id })
      .del();
  } else if (!updatingAwards || updatingAwards.length === 0) {
    await trx<AwardDb>(AWARD_TABLE_NAME).where({ prize_id: id }).del();
  }

  // Create or Update Award records included in the awards array.
  let playerAwards: AwardApi[] = [];
  if (input.awards) {
    const createdAwards = await Promise.all(
      input.awards.map((a) =>
        a.id
          ? updateAward(context, trx, a.id, a)
          : createAward(context, trx, { ...a, prizeId: rows[0].id }),
      ),
    );
    playerAwards = createdAwards.filter(Boolean) as AwardApi[];
  }

  return { ...asModel(rows[0]), awards: playerAwards, awardsCount: playerAwards?.length };
};

export const deleteById = async (
  _context: Context,
  trx: Knex.Transaction,
  id: PrizeApi['id'],
): Promise<PrizeApi> => {
  const rows = await trx<PrizeDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      deleted_at: new Date(),
    })
    .returning<PrizeDb[]>('*');

  if (!rows.length) {
    throw createHttpError(404, `Prize ${id} not found.`);
  }

  await trx<AwardDb>(AWARD_TABLE_NAME).where({ prize_id: id }).del();

  return asModel(rows[0]);
};
