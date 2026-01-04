import type { Context } from '@/types';

// Stable UUIDs for seed data - can be referenced in Bruno API tests
export const SEED_IDS = {
  // Users
  ADMIN_USER: '00000000-0000-0000-0000-000000000001',
  TEST_USER_1: '00000000-0000-0000-0000-000000000002',
  TEST_USER_2: '00000000-0000-0000-0000-000000000003',

  // Players
  PLAYER_1: '10000000-0000-0000-0000-000000000001', // DAN player
  PLAYER_2: '10000000-0000-0000-0000-000000000002', // SDK player
  PLAYER_3: '10000000-0000-0000-0000-000000000003', // DDK player
  PLAYER_4: '10000000-0000-0000-0000-000000000004', // DDK player

  // Events
  EVENT_WINTER_2025: '20000000-0000-0000-0000-000000000001',
  EVENT_SPRING_2025: '20000000-0000-0000-0000-000000000002',

  // Prizes
  PRIZE_BOOK_SET: '30000000-0000-0000-0000-000000000001',
  PRIZE_GO_BOARD: '30000000-0000-0000-0000-000000000002',
  PRIZE_STONES_SET: '30000000-0000-0000-0000-000000000003',
  PRIZE_BOOK_SET2: '30000000-0000-0000-0000-000000000004',

  // Awards
  AWARD_1: '40000000-0000-0000-0000-000000000001',
  AWARD_2: '40000000-0000-0000-0000-000000000002',
  AWARD_3: '40000000-0000-0000-0000-000000000003',
  AWARD_4: '40000000-0000-0000-0000-000000000004',

  // Results
  RESULT_WINTER_2025: '50000000-0000-0000-0000-000000000001',

  // Registrants
  REGISTRANT_1: '60000000-0000-0000-0000-000000000001',
  REGISTRANT_2: '60000000-0000-0000-0000-000000000002',
  REGISTRANT_3: '60000000-0000-0000-0000-000000000003',
  REGISTRANT_4: '60000000-0000-0000-0000-000000000004',
} as const;

export const loadSeedData = async (context: Context) => {
  const { db } = context;

  console.log('Starting seed data creation...');

  // Helper function to insert a single row with error handling
  const insertRow = async (table: string, row: any, identifier: string) => {
    try {
      await db(table).insert(row);
      return { success: true, identifier };
    } catch (error: any) {
      // Only log if it's not a duplicate key error
      if (!error.detail?.includes('already exists') && error.code !== '23505') {
        console.log(`  ⚠ Failed to insert ${identifier}: ${error.detail || error.message}`);
      }
      return { success: false, identifier, error: error.detail };
    }
  };

  // 1. Create Users
  const users = [
    {
      id: SEED_IDS.ADMIN_USER,
      email: 'admin@example.com',
      one_time_passes: JSON.stringify(['pass1234']),
      scope: 'ADMIN',
      created_at: new Date('2025-01-01T00:00:00Z'),
    },
    {
      id: SEED_IDS.TEST_USER_1,
      email: 'user1@example.com',
      one_time_passes: JSON.stringify(['pass1234']),
      scope: 'USER',
      created_at: new Date('2025-01-02T00:00:00Z'),
    },
    {
      id: SEED_IDS.TEST_USER_2,
      email: 'user2@example.com',
      one_time_passes: JSON.stringify(['pass1234']),
      scope: 'USER',
      created_at: new Date('2025-01-03T00:00:00Z'),
    },
  ];

  const userResults = await Promise.all(
    users.map((user, idx) => insertRow('users', user, `user ${idx + 1} (${user.email})`)),
  );
  const createdUsers = userResults.filter((r) => r.success).length;
  console.log(`✓ Users: ${createdUsers} created, ${users.length - createdUsers} already existed`);

  // 2. Create Players
  const players = [
    {
      id: SEED_IDS.PLAYER_1,
      user_id: SEED_IDS.TEST_USER_1,
      aga_id: '12345',
      name: 'Alice Johnson',
      rank: 3.5, // 3 dan
      created_at: new Date('2025-01-02T00:00:00Z'),
    },
    {
      id: SEED_IDS.PLAYER_2,
      user_id: SEED_IDS.TEST_USER_1,
      aga_id: '12346',
      name: 'Bob Smith',
      rank: -2.0, // 2 kyu
      created_at: new Date('2025-01-02T01:00:00Z'),
    },
    {
      id: SEED_IDS.PLAYER_3,
      user_id: SEED_IDS.TEST_USER_2,
      aga_id: '12347',
      name: 'Carol Williams',
      rank: -8.5, // 8 kyu
      created_at: new Date('2025-01-03T00:00:00Z'),
    },
    {
      id: SEED_IDS.PLAYER_4,
      user_id: SEED_IDS.ADMIN_USER,
      aga_id: '12348',
      name: 'Bob Ross',
      rank: -2.5, // 8 kyu
      created_at: new Date('2025-01-04T00:00:00Z'),
    },
  ];

  const playerResults = await Promise.all(
    players.map((player, idx) =>
      insertRow('players', player, `player ${idx + 1} (${player.name})`),
    ),
  );
  const createdPlayers = playerResults.filter((r) => r.success).length;
  console.log(
    `✓ Players: ${createdPlayers} created, ${players.length - createdPlayers} already existed`,
  );

  // 3. Create Events
  const events = [
    {
      id: SEED_IDS.EVENT_WINTER_2025,
      title: 'Winter Tournament 2025',
      slug: 'winter-tournament-2025',
      description: 'Annual winter go tournament with prizes for all divisions',
      start_at: new Date('2025-02-01T09:00:00Z'),
      end_at: new Date('2025-02-03T18:00:00Z'),
      created_at: new Date('2025-01-15T00:00:00Z'),
    },
    {
      id: SEED_IDS.EVENT_SPRING_2025,
      title: 'Spring Championship 2025',
      slug: 'spring-championship-2025',
      description: 'Premier spring event for advanced players',
      start_at: new Date('2025-04-15T09:00:00Z'),
      end_at: new Date('2025-04-17T18:00:00Z'),
      created_at: new Date('2025-01-20T00:00:00Z'),
    },
  ];

  const eventResults = await Promise.all(
    events.map((event, idx) => insertRow('events', event, `event ${idx + 1} (${event.title})`)),
  );
  const createdEvents = eventResults.filter((r) => r.success).length;
  console.log(
    `✓ Events: ${createdEvents} created, ${events.length - createdEvents} already existed`,
  );

  // 4. Create Prizes
  const prizes = [
    {
      id: SEED_IDS.PRIZE_BOOK_SET,
      event_id: SEED_IDS.EVENT_WINTER_2025,
      title: 'Go Book Collection',
      description: 'Complete set of advanced go strategy books',
      url: 'https://example.com/books',
      contact: 'books@example.com',
      sponsor: 'Kiseido Publishing',
      recommended_rank: 'DAN',
      created_at: new Date('2025-01-15T01:00:00Z'),
    },
    {
      id: SEED_IDS.PRIZE_GO_BOARD,
      event_id: SEED_IDS.EVENT_WINTER_2025,
      title: 'Professional Go Board',
      description: 'Handcrafted wooden go board with shell and slate stones',
      url: 'https://example.com/board',
      contact: 'equipment@example.com',
      sponsor: 'Yellow Mountain Imports',
      recommended_rank: 'ALL',
      created_at: new Date('2025-01-15T02:00:00Z'),
    },
    {
      id: SEED_IDS.PRIZE_STONES_SET,
      event_id: SEED_IDS.EVENT_SPRING_2025,
      title: 'Premium Stones Set',
      description: 'High-quality yunzi stones in bamboo bowls',
      url: 'https://example.com/stones',
      contact: 'stones@example.com',
      sponsor: null,
      recommended_rank: 'SDK',
      created_at: new Date('2025-01-20T01:00:00Z'),
    },
    {
      id: SEED_IDS.PRIZE_BOOK_SET2,
      event_id: SEED_IDS.EVENT_SPRING_2025,
      title: 'Advanced Go Book Collection',
      description: 'Complete set of advanced go strategy books - Volume 2',
      url: 'https://example.com/stones',
      contact: 'stones@example.com',
      sponsor: 'Slate & Shell Publishing',
      recommended_rank: 'SDK',
      created_at: new Date('2025-01-20T01:00:00Z'),
    },
  ];

  const prizeResults = await Promise.all(
    prizes.map((prize, idx) => insertRow('prizes', prize, `prize ${idx + 1} (${prize.title})`)),
  );
  const createdPrizes = prizeResults.filter((r) => r.success).length;
  console.log(
    `✓ Prizes: ${createdPrizes} created, ${prizes.length - createdPrizes} already existed`,
  );

  // 5. Create Awards (unassigned prizes)
  const awards = [
    {
      id: SEED_IDS.AWARD_1,
      prize_id: SEED_IDS.PRIZE_BOOK_SET,
      player_id: null, // Available
      redeem_code: 'BOOK-2025-001',
      value: 1,
      created_at: new Date('2025-01-15T03:00:00Z'),
    },
    {
      id: SEED_IDS.AWARD_2,
      prize_id: SEED_IDS.PRIZE_GO_BOARD,
      player_id: SEED_IDS.PLAYER_1, // Assigned to Alice
      redeem_code: 'BOARD-2025-001',
      value: 1,
      created_at: new Date('2025-01-15T04:00:00Z'),
    },
    {
      id: SEED_IDS.AWARD_3,
      prize_id: SEED_IDS.PRIZE_STONES_SET,
      player_id: null, // Available
      redeem_code: 'STONES-2025-001',
      value: 1,
      created_at: new Date('2025-01-20T02:00:00Z'),
    },
    {
      id: SEED_IDS.AWARD_4,
      prize_id: SEED_IDS.PRIZE_BOOK_SET2,
      player_id: null, // Available
      redeem_code: 'BOOK2-2025-001',
      value: 1,
      created_at: new Date('2025-01-20T02:00:00Z'),
    },
  ];

  const awardResults = await Promise.all(
    awards.map((award, idx) =>
      insertRow('awards', award, `award ${idx + 1} (${award.redeem_code})`),
    ),
  );
  const createdAwards = awardResults.filter((r) => r.success).length;
  console.log(
    `✓ Awards: ${createdAwards} created, ${awards.length - createdAwards} already existed`,
  );

  // 6. Create Results
  const results = [
    {
      id: SEED_IDS.RESULT_WINTER_2025,
      event_id: SEED_IDS.EVENT_WINTER_2025,
      winners: JSON.stringify([
        { division: 'DAN', agaId: '12345', place: 1 },
        { division: 'SDK', agaId: '12346', place: 1 },
        { division: 'DDK', agaId: '12347', place: 1 },
      ]),
      awards: JSON.stringify([]),
      created_at: new Date('2025-02-03T20:00:00Z'),
    },
  ];

  const resultResults = await Promise.all(
    results.map((result, idx) =>
      insertRow('results', result, `result ${idx + 1} (event ${result.event_id})`),
    ),
  );
  const createdResults = resultResults.filter((r) => r.success).length;
  console.log(
    `✓ Results: ${createdResults} created, ${results.length - createdResults} already existed`,
  );

  // 7. Create Registrants
  const registrants = [
    {
      id: SEED_IDS.REGISTRANT_1,
      player_id: SEED_IDS.PLAYER_1,
      event_id: SEED_IDS.EVENT_WINTER_2025,
      registration_date: new Date('2025-01-20T10:00:00Z'),
      status: 'confirmed',
      notes: 'Paid in full',
      created_at: new Date('2025-01-20T10:00:00Z'),
    },
    {
      id: SEED_IDS.REGISTRANT_2,
      player_id: SEED_IDS.PLAYER_2,
      event_id: SEED_IDS.EVENT_WINTER_2025,
      registration_date: new Date('2025-01-21T14:30:00Z'),
      status: 'confirmed',
      notes: null,
      created_at: new Date('2025-01-21T14:30:00Z'),
    },
    {
      id: SEED_IDS.REGISTRANT_3,
      player_id: SEED_IDS.PLAYER_3,
      event_id: SEED_IDS.EVENT_WINTER_2025,
      registration_date: new Date('2025-01-22T09:15:00Z'),
      status: 'waitlist',
      notes: 'Waiting for payment confirmation',
      created_at: new Date('2025-01-22T09:15:00Z'),
    },
    {
      id: SEED_IDS.REGISTRANT_4,
      player_id: SEED_IDS.PLAYER_1,
      event_id: SEED_IDS.EVENT_SPRING_2025,
      registration_date: new Date('2025-02-10T16:45:00Z'),
      status: 'confirmed',
      notes: 'Early bird registration',
      created_at: new Date('2025-02-10T16:45:00Z'),
    },
  ];

  const registrantResults = await Promise.all(
    registrants.map((registrant, idx) =>
      insertRow(
        'registrants',
        registrant,
        `registrant ${idx + 1} (player ${registrant.player_id} -> event ${registrant.event_id})`,
      ),
    ),
  );
  const createdRegistrants = registrantResults.filter((r) => r.success).length;
  console.log(
    `✓ Registrants: ${createdRegistrants} created, ${registrants.length - createdRegistrants} already existed`,
  );

  console.log('✅ Seed data creation complete');
};
