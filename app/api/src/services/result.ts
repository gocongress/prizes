import { getTopAvailableAwardForPlayer, updateById as updateAwardById } from '@/models/award';
import { getById as getEventById } from '@/models/event';
import { getByAgaId } from '@/models/player';
import {
  clearFinalization,
  create,
  deleteById,
  finalizeAllocation,
  getAll,
  getByEventId,
  getById,
  hasActiveAllocationLock,
  lockAllocation,
  TABLE_NAME as RESULTS_TABLE_NAME,
  updateAwardsById,
  updateById,
} from '@/models/result';
import {
  AllocationKind,
  type AllocateAwards,
  type AllocationRecommendations,
  type CreateResult,
  type ImportResults,
  type ResultApi,
  type ResultAward,
  type ResultDb,
  type ResultQueryParams,
  type UpdateResult,
  type Winner,
} from '@/schemas/result';
import type { Context, ServiceParams } from '@/types';
import createHttpError from 'http-errors';
import { randomUUID } from 'node:crypto';

export const getAllResult = async (args: {
  serviceParams: ServiceParams<void>;
  queryParams: ResultQueryParams;
}) => {
  const context = args.serviceParams.context;
  const { items, ...rest } = await getAll(context, args.queryParams);
  context.logger.info({ ...rest });
  return { items, ...rest };
};

export const createResult = async ({
  context,
  input,
}: ServiceParams<CreateResult>): Promise<ResultApi> => {
  if (!input) {
    throw new Error('Create result input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await create(context, trx, input);
    await trx.commit();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const getResultById = async ({
  context,
  input,
}: ServiceParams<ResultApi['id']>): Promise<ResultApi> => {
  if (!input) {
    throw new Error('Result ID is missing.');
  }
  const result = await getById(context, input);

  return result;
};

export const getResultByEventId = async ({
  context,
  input,
}: ServiceParams<ResultApi['eventId']>): Promise<ResultApi | undefined> => {
  if (!input) {
    throw new Error('Event ID is missing.');
  }
  const result = await getByEventId(context, input);

  return result;
};

export const updateResultById = async ({
  context,
  input,
}: ServiceParams<UpdateResult & { id: ResultApi['id'] }>): Promise<ResultApi> => {
  if (!input) {
    throw new Error('Update result input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await updateById(context, trx, input.id, input);
    await trx.commit();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const deleteResultById = async ({
  context,
  input,
}: ServiceParams<ResultApi['id']>): Promise<ResultApi> => {
  if (!input) {
    throw new Error('Result ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await deleteById(context, trx, input);
    await trx.commit();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const bulkSyncResults = async (context: Context, input: ImportResults): Promise<void> => {
  const hasMultipleEventIds = input.results.map((row) => row.eventId.trim());
  const uniqueEventIds = new Set(hasMultipleEventIds);
  if (uniqueEventIds.size !== 1) {
    throw new Error(
      'Multiple event IDs found. All results must belong to a single event ID for bulk sync.',
    );
  }

  const eventId = input.results[0].eventId;

  // Build winners JSON with player names
  const winnersJson = await Promise.all(
    input.results.map(async ({ division, agaId, place }) => {
      const player = await getByAgaId(context, agaId);
      return {
        division,
        agaId,
        place,
        name: player?.name ?? null,
      };
    }),
  );

  // Check if a result already exists for this event
  const existingResult = await getByEventId(context, eventId);

  if (existingResult) {
    // Update existing result's winners
    await context
      .db<ResultDb>(RESULTS_TABLE_NAME)
      .where({ id: existingResult.id })
      .update({ winners: JSON.stringify(winnersJson) });

    context.logger.info(
      { resultId: existingResult.id, eventId },
      'Updated existing result with new winners',
    );
  } else {
    // Insert new result
    await context.db.raw(
      `
      INSERT INTO results (id, event_id, winners)
      VALUES (?, ?, ?)
      RETURNING id, event_id;
    `,
      [randomUUID(), eventId, JSON.stringify(winnersJson)],
    );

    context.logger.info({ eventId }, 'Created new result for event');
  }
};

/**
 * Deallocates awards from a result.
 * Unassigns all awards from their players and clears the result's awards array.
 * Also clears the allocation lock and finalization status.
 */
export const deallocateAwardsFromResult = async ({
  context,
  input,
}: ServiceParams<ResultApi['id']>): Promise<AllocationRecommendations> => {
  if (!input) {
    throw createHttpError(400, 'Result ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    // Get the result with its awards
    const result = await getById(context, input);
    if (!result) {
      throw createHttpError(404, `Result ${input} not found.`);
    }

    context.logger.info(
      { resultId: result.id, awardCount: result.awards.length },
      'Deallocating awards from result',
    );

    // Unassign all previously allocated awards (set player_id to null)
    for (const previousAward of result.awards) {
      await updateAwardById(context, trx, previousAward.awardId, { playerId: null });
      context.logger.info(
        { awardId: previousAward.awardId, playerId: previousAward.playerId },
        'Unassigned award from player',
      );
    }

    // Clear the awards array in the result
    await updateAwardsById(context, trx, input, []);

    // Clear allocation lock and finalization status
    const updatedResult = await clearFinalization(context, trx, input);

    await trx.commit();
    context.logger.info({ resultId: result.id }, 'Successfully deallocated all awards');
    return {
      recommendations: updatedResult.awards,
      locked: false,
      finalized: false,
    };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

/**
 * Orders the winners for award allocation.
 */
const orderWinnersForAwardAllocation = (result: ResultApi): Winner[] => {
  // For now, use the order in which the winners were originally provided
  return [...result.winners];
};

/**
 * Generates allocation recommendations without persisting the award allocation.
 * Returns recommended award allocations based on player preferences and default prize ordering.
 * Locks the allocation to prevent concurrent allocations from other results.
 */
export const getAllocationRecommendations = async ({
  context,
  input,
}: ServiceParams<ResultApi['id']>): Promise<AllocationRecommendations> => {
  if (!input) {
    throw createHttpError(400, 'Result ID is missing.');
  }

  // Check if there are any active allocation locks from other results
  const hasOtherLocks = await hasActiveAllocationLock(context, input);
  if (hasOtherLocks) {
    throw createHttpError(
      409,
      'Another result currently has an active allocation in progress. Please wait until that allocation is finalized or cancelled.',
    );
  }

  // Get the result with its winners
  const result = await getById(context, input);
  if (!result) {
    throw createHttpError(404, `Result ${input} not found.`);
  }

  // Get the event for event title
  const event = await getEventById(context, result.eventId);
  if (!event) {
    throw createHttpError(404, `Event ${result.eventId} not found.`);
  }

  const trx = await context.db.transaction();
  try {
    // Disallow concurrent award allocations from occurring to prevent potential for awarding
    // the same prize more than once. Award allocation can only happen on one set of results at a time.
    await lockAllocation(context, trx, input);

    // Using the order in which the winners were provided
    const sortedWinners = orderWinnersForAwardAllocation(result);

    const recommendations: ResultAward[] = [];
    const recommendedAwards = new Set<string>();

    for (const winner of sortedWinners) {
      // Get player by agaId
      const player = await getByAgaId(context, winner.agaId);
      if (!player) {
        context.logger.error(
          { agaId: winner.agaId },
          `Player with AGA ID ${winner.agaId} not found.`,
        );
        throw createHttpError(
          400,
          `Unable to find a valid player with AGA ID ${winner.agaId}. Please ensure all winners have valid AGA IDs.`,
        );
      }

      // Find the best award available which has not yet been allocated in this process or previously assigned
      const awardResult = await getTopAvailableAwardForPlayer({
        context,
        trx,
        playerId: player.id,
        notInAwardIds: Array.from(recommendedAwards.keys()),
      });
      if (!awardResult) {
        context.logger.error(
          { playerId: player.id, agaId: winner.agaId },
          `No available awards for player ${player.name}. Skipping.`,
        );
        continue;
      }
      recommendedAwards.add(awardResult.award.id);

      // Add to recommendations array (without actually assigning)
      const { award, preferenceOrder, fromPreference } = awardResult;
      recommendations.push({
        playerId: player.id,
        playerName: player.name,
        playerAgaId: player.agaId,
        place: winner.place,
        division: winner.division,
        prizeTitle: award.prizeTitle || '',
        awardId: award.id,
        awardValue: award.value,
        awardRedeemCode: award.redeemCode,
        userEmail: player.email || null,
        awardAt: new Date().toISOString(),
        eventTitle: event.title,
        awardPreferenceOrder: preferenceOrder,
        allocationKind: fromPreference ? AllocationKind.PREFERENCE : AllocationKind.DEFAULT,
      });

      context.logger.info(
        { playerId: player.id, awardId: award.id, fromPreference, preferenceOrder },
        `Recommended award ${award.id} for player ${player.name}`,
      );
    }

    await trx.commit();

    context.logger.info(
      { resultId: result.id, recommendationCount: recommendations.length },
      'Generated allocation recommendations and locked allocation',
    );

    return {
      recommendations,
      locked: true,
      finalized: false,
    };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

/**
 * Allocates awards to winners based on client-provided allocations.
 * The client can modify the recommendations before submitting.
 * Finalizes the allocation and releases the lock.
 */
export const allocateAwardsToWinners = async ({
  context,
  input,
}: ServiceParams<{ id: ResultApi['id']; awards: AllocateAwards }>): Promise<ResultApi> => {
  if (!input?.id) {
    throw createHttpError(400, 'Result ID is missing.');
  }

  if (!input.awards || input.awards.length === 0) {
    throw createHttpError(400, 'Awards array is missing or empty.');
  }

  const trx = await context.db.transaction();
  try {
    // Get the result
    const result = await getById(context, input.id);
    if (!result) {
      throw createHttpError(404, `Result ${input.id} not found.`);
    }

    // Verify this result has the allocation lock
    if (!result.allocationLockedAt) {
      throw createHttpError(
        400,
        'Result does not have an allocation lock. Please get recommendations first.',
      );
    }

    // If result already has finalized awards, don't allow reallocation
    if (result.allocationFinalizedAt) {
      throw createHttpError(
        400,
        'Result allocation is already finalized. Deallocate first to reallocate.',
      );
    }

    context.logger.info(
      { resultId: result.id, awardCount: input.awards.length },
      'Allocating awards to winners',
    );

    // If result already has awards, clear them first
    if (result.awards && result.awards.length > 0) {
      context.logger.info(
        { resultId: result.id, previousAwardCount: result.awards.length },
        'Clearing previous award allocations',
      );

      // Unassign all previously allocated awards (set player_id to null)
      for (const previousAward of result.awards) {
        await updateAwardById(context, trx, previousAward.awardId, { playerId: null });
        context.logger.info(
          { awardId: previousAward.awardId, playerId: previousAward.playerId },
          'Unassigned award from player',
        );
      }
    }

    // Allocate the awards as provided by the client
    for (const award of input.awards) {
      await updateAwardById(context, trx, award.awardId, { playerId: award.playerId });
      context.logger.info(
        { awardId: award.awardId, playerId: award.playerId },
        'Assigned award to player',
      );
    }

    // Update the result with the allocated awards
    await updateAwardsById(context, trx, input.id, input.awards);

    // Finalize the allocation (this also keeps the lock timestamp but adds finalization)
    const updatedResult = await finalizeAllocation(context, trx, input.id);

    await trx.commit();

    context.logger.info(
      { resultId: result.id, awardCount: input.awards.length },
      'Successfully allocated and finalized awards',
    );

    return updatedResult;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};
