# Seed Data Reference

This document describes the stable seed data IDs that can be used in Bruno API tests.

## Overview

The seed data uses **stable UUIDs** with predictable patterns, making it easy to reference in API tests without needing to query the database first.

## UUID Patterns

- **Users**: `00000000-0000-0000-0000-00000000000X`
- **Players**: `10000000-0000-0000-0000-00000000000X`
- **Events**: `20000000-0000-0000-0000-00000000000X`
- **Prizes**: `30000000-0000-0000-0000-00000000000X`
- **Awards**: `40000000-0000-0000-0000-00000000000X`
- **Results**: `50000000-0000-0000-0000-00000000000X`

## Seed Data Details

### Users

| Name        | ID                                     | Email             | Scope | One-Time Pass |
| ----------- | -------------------------------------- | ----------------- | ----- | ------------- |
| Admin User  | `00000000-0000-0000-0000-000000000001` | admin@example.com | ADMIN | pass1234      |
| Test User 1 | `00000000-0000-0000-0000-000000000002` | user1@example.com | USER  | pass1234      |
| Test User 2 | `00000000-0000-0000-0000-000000000003` | user2@example.com | USER  | pass1234      |

### Players

| Name           | ID                                     | User ID     | AGA ID | Rank | Description  |
| -------------- | -------------------------------------- | ----------- | ------ | ---- | ------------ |
| Alice Johnson  | `10000000-0000-0000-0000-000000000001` | TEST_USER_1 | 12345  | 3.5  | 3 dan player |
| Bob Smith      | `10000000-0000-0000-0000-000000000002` | TEST_USER_1 | 12346  | -2.0 | 2 kyu player |
| Carol Williams | `10000000-0000-0000-0000-000000000003` | TEST_USER_2 | 12347  | -8.5 | 8 kyu player |

### Events

| Title                    | ID                                     | Start Date           | End Date             |
| ------------------------ | -------------------------------------- | -------------------- | -------------------- |
| Winter Tournament 2025   | `20000000-0000-0000-0000-000000000001` | 2025-02-01T09:00:00Z | 2025-02-03T18:00:00Z |
| Spring Championship 2025 | `20000000-0000-0000-0000-000000000002` | 2025-04-15T09:00:00Z | 2025-04-17T18:00:00Z |

### Prizes

| Title                 | ID                                     | Event ID          | Recommended Rank |
| --------------------- | -------------------------------------- | ----------------- | ---------------- |
| Go Book Collection    | `30000000-0000-0000-0000-000000000001` | EVENT_WINTER_2025 | DAN              |
| Professional Go Board | `30000000-0000-0000-0000-000000000002` | EVENT_WINTER_2025 | ALL              |
| Premium Stones Set    | `30000000-0000-0000-0000-000000000003` | EVENT_SPRING_2025 | SDK              |

### Awards

| ID                                     | Prize ID         | Player ID | Redeem Code     | Status            |
| -------------------------------------- | ---------------- | --------- | --------------- | ----------------- |
| `40000000-0000-0000-0000-000000000001` | PRIZE_BOOK_SET   | null      | BOOK-2025-001   | Available         |
| `40000000-0000-0000-0000-000000000002` | PRIZE_GO_BOARD   | PLAYER_1  | BOARD-2025-001  | Assigned to Alice |
| `40000000-0000-0000-0000-000000000003` | PRIZE_STONES_SET | null      | STONES-2025-001 | Available         |

### Results

| ID                                     | Event ID          | Winners                                              |
| -------------------------------------- | ----------------- | ---------------------------------------------------- |
| `50000000-0000-0000-0000-000000000001` | EVENT_WINTER_2025 | DAN: 12345 (1st), SDK: 12346 (1st), DDK: 12347 (1st) |

## Using in Bruno Tests

### Environment Variables

All seed IDs are available as environment variables in the `localhost` environment:

```
{{adminUserId}}
{{testUser1Id}}
{{player1Id}}
{{eventWinter2025Id}}
{{prizeBookSetId}}
{{award1Id}}
{{resultWinter2025Id}}
{{adminEmail}}
{{adminPass}}
```

### Example Usage

**Login as admin:**

```json
{
  "email": "{{adminEmail}}",
  "oneTimePass": "{{adminPass}}"
}
```

**Get a specific user:**

```
GET {{baseUrl}}/api/v1/admin/users/{{testUser1Id}}
```

**Get a specific event:**

```
GET {{baseUrl}}/api/v1/admin/events/{{eventWinter2025Id}}
```

**Get a specific prize:**

```
GET {{baseUrl}}/api/v1/prizes/{{prizeBookSetId}}
```

## Loading Seed Data

The seed data is automatically loaded when the server starts in development mode, or can be manually triggered via the seed endpoint (if implemented).

## Notes

- All seed data uses stable UUIDs that won't change between runs
- The seed data is idempotent - running it multiple times won't create duplicates (may need to clear database first)
- One-time passes are simple strings for testing purposes only
- Award #2 is pre-assigned to Player 1 (Alice Johnson) to test assigned vs available awards
