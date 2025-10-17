# Image Generation API Documentation

**Base URL**: `http://localhost:3000`
**Port**: 3000
**Runtime**: Bun
**Language**: TypeScript

---

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Image Generation Endpoints](#image-generation-endpoints)
4. [Player Data Endpoints](#player-data-endpoints)
5. [Cache Management](#cache-management)
6. [Summary Endpoint](#summary-endpoint)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)

---

## Authentication

All endpoints require a valid `HYPIXEL_API_KEY` environment variable.

```env
HYPIXEL_API_KEY=your_api_key_here
```

Get a free API key from: https://developer.hypixel.net/

**Error Response** (if key not set):
```json
{
  "error": "HYPIXEL_API_KEY not configured"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing parameters) |
| 404 | Resource not found |
| 429 | Rate limited by Hypixel API |
| 500 | Server error |

### Common Errors

**Missing Parameter**:
```json
{
  "error": "Missing username parameter"
}
```

**Invalid Player**:
```json
{
  "error": "Hypixel API Error: Player does not exist"
}
```

**Rate Limited**:
```json
{
  "error": "Hypixel API Error: You are being rate limited"
}
```

---

## Image Generation Endpoints

### GET /stats/:ign

Generate a player statistics image by in-game name.

**Parameters**:
- `ign` (path, required): Player's in-game name
- `watermark` (query, optional): Text to display on image
- `censor` (query, optional): "true" or "false" to censor player names

**Example**:
```bash
curl "http://localhost:3000/stats/Technoblade?watermark=MyWatermark&censor=false" -o stats.png
```

**Response**: PNG image (gzip-compressed)

**Headers**:
```
Content-Type: image/png
Content-Encoding: gzip
```

**Errors**:
- 400: Missing IGN
- 404: Invalid username
- 500: Image generation failed

---

### GET /bearer/:bearer

Generate a player statistics image using a bearer token.

**Parameters**:
- `bearer` (path, required): Bearer token
- `watermark` (query, optional): Text to display on image
- `censor` (query, optional): "true" or "false" to censor player names

**Example**:
```bash
curl "http://localhost:3000/bearer/your-bearer-token?watermark=Stats" -o stats.png
```

**Response**: PNG image (gzip-compressed)

**Errors**:
- 400: Missing bearer token
- 404: Invalid bearer token
- 500: Image generation failed

---

## Player Data Endpoints

### GET /api/player/:username

Get full player statistics by username.

**Parameters**:
- `username` (path, required): Player's username

**Example**:
```bash
curl "http://localhost:3000/api/player/Technoblade"
```

**Response**:
```json
{
  "success": true,
  "player": {
    "uuid": "99f00191e5fb47e8b8061afc906e7e77",
    "name": "Technoblade",
    "level": 175,
    "firstLogin": "2013-06-15T00:00:00Z",
    "lastLogin": "2024-10-15T12:30:00Z",
    "stats": {
      "Bedwars": {...},
      "SkyBlock": {...},
      "Duels": {...}
    },
    "rank": "MVP+",
    "ranksgifted": 2
  }
}
```

**Caching**: 5 minutes

---

### GET /api/player/uuid/:uuid

Get full player statistics by UUID.

**Parameters**:
- `uuid` (path, required): Player's UUID

**Example**:
```bash
curl "http://localhost:3000/api/player/uuid/99f00191e5fb47e8b8061afc906e7e77"
```

**Response**: Same as `/api/player/:username`

**Caching**: 5 minutes

---

## Bedwars Endpoints

### GET /api/bedwars/stats/:uuid

Get Bedwars statistics for a player.

**Parameters**:
- `uuid` (path, required): Player's UUID

**Example**:
```bash
curl "http://localhost:3000/api/bedwars/stats/99f00191e5fb47e8b8061afc906e7e77"
```

**Response**:
```json
{
  "level": 1234,
  "fkdr": 5.67,
  "wins": 8900,
  "kills": 23456,
  "deaths": 4123,
  "winstreak": 45,
  "finalKills": 12345,
  "finalDeaths": 2100
}
```

**Returns**: `null` if player has no Bedwars stats

**Caching**: 5 minutes

---

## Skyblock Endpoints

### GET /api/skyblock/profiles/:uuid

Get all Skyblock profiles for a player.

**Parameters**:
- `uuid` (path, required): Player's UUID

**Example**:
```bash
curl "http://localhost:3000/api/skyblock/profiles/99f00191e5fb47e8b8061afc906e7e77"
```

**Response**:
```json
{
  "success": true,
  "profiles": [
    {
      "profile_id": "abc123def456ghi789",
      "cute_name": "Alchemy",
      "members": {
        "99f00191e5fb47e8b8061afc906e7e77": {
          "profile": {
            "levels": {...},
            "networth": 9999999999,
            "level": 45
          }
        }
      }
    },
    {
      "profile_id": "def456ghi789jkl012",
      "cute_name": "Combat",
      "members": {...}
    }
  ]
}
```

**Caching**: 5 minutes

---

### GET /api/skyblock/profile/:profileId

Get specific Skyblock profile details.

**Parameters**:
- `profileId` (path, required): Skyblock profile ID

**Example**:
```bash
curl "http://localhost:3000/api/skyblock/profile/abc123def456ghi789"
```

**Response**:
```json
{
  "success": true,
  "profile": {
    "profile_id": "abc123def456ghi789",
    "cute_name": "Alchemy",
    "members": {...},
    "banking": {...}
  }
}
```

**Caching**: 5 minutes

---

## Guild Endpoints

### GET /api/guild/player/:uuid

Get guild information by player UUID.

**Parameters**:
- `uuid` (path, required): Player's UUID

**Example**:
```bash
curl "http://localhost:3000/api/guild/player/99f00191e5fb47e8b8061afc906e7e77"
```

**Response**:
```json
{
  "success": true,
  "guild": {
    "_id": "guild123",
    "name": "Hypixel",
    "level": 50,
    "tag": "Hypixel",
    "members": [...],
    "created": "2013-06-15T00:00:00Z"
  }
}
```

**Returns**: `null` if player not in guild

**Caching**: 5 minutes

---

### GET /api/guild/name/:guildName

Get guild information by name.

**Parameters**:
- `guildName` (path, required): Guild name

**Example**:
```bash
curl "http://localhost:3000/api/guild/name/Hypixel"
```

**Response**: Same as `/api/guild/player/:uuid`

**Caching**: 5 minutes

---

## Summary Endpoint

### GET /api/summary/:username

Get player summary with key statistics.

**Parameters**:
- `username` (path, required): Player's username

**Example**:
```bash
curl "http://localhost:3000/api/summary/Technoblade"
```

**Response**:
```json
{
  "username": "Technoblade",
  "Rank": "MVP+",
  "NWL": 45,
  "Gifted": 2,
  "NW": 500000000,
  "SA": "52.50",
  "LVL": 175
}
```

**Fields**:
- `Rank`: Player rank (or "None")
- `NWL`: Skyblock level
- `Gifted`: Ranks gifted to others
- `NW`: Net worth (Skyblock)
- `SA`: Skill average (2 decimals)
- `LVL`: Network level

**Caching**: 5 minutes

---

### GET /api/summary/uuid/:uuid

Get player summary by UUID.

**Parameters**:
- `uuid` (path, required): Player's UUID

**Example**:
```bash
curl "http://localhost:3000/api/summary/uuid/99f00191e5fb47e8b8061afc906e7e77"
```

**Response**: Same as `/api/summary/:username`, plus includes `uuid` field

**Caching**: 5 minutes

---

## Cache Management

### GET /api/cache/stats

Get current cache statistics.

**Example**:
```bash
curl "http://localhost:3000/api/cache/stats"
```

**Response**:
```json
{
  "cacheSize": 5,
  "cacheDuration": "5 minutes",
  "entries": [
    "player:key=xxx&name=Technoblade (298s remaining)",
    "bedwars:key=xxx&uuid=99f... (245s remaining)",
    "guild:key=xxx&player=99f... (200s remaining)"
  ]
}
```

---

### POST /api/cache/clear

Clear all cached entries.

**Example**:
```bash
curl -X POST "http://localhost:3000/api/cache/clear"
```

**Response**:
```json
{
  "message": "Cache cleared successfully"
}
```

---

### POST /api/cache/prune

Remove expired cache entries.

**Example**:
```bash
curl -X POST "http://localhost:3000/api/cache/prune"
```

**Response**:
```json
{
  "message": "Removed 2 expired entries"
}
```

---

## Rate Limiting

**Hypixel API Limit**: 120 requests per minute

**Cache Benefits**:
- Same player: 1 API call per 5 minutes (0.2 req/min)
- 100 different players: ~20 API calls per 5 minutes
- Still well under the 120 req/min limit

**Cache Duration**: 5 minutes (300 seconds)

---

## Examples

### Example 1: Get Player Summary
```bash
curl "http://localhost:3000/api/summary/Technoblade"
```

Output:
```json
{
  "username": "Technoblade",
  "Rank": "MVP+",
  "NWL": 45,
  "Gifted": 2,
  "NW": 500000000,
  "SA": "52.50",
  "LVL": 175
}
```

---

### Example 2: Generate Stats Image
```bash
curl "http://localhost:3000/stats/Technoblade?watermark=Generated%20$(date +%Y-%m-%d)" -o stats.png
```

Creates `stats.png` with player statistics and watermark.

---

### Example 3: Get Bedwars Stats Then Guild
```bash
# Get player UUID
PLAYER=$(curl -s "http://localhost:3000/api/player/Technoblade")
UUID=$(echo $PLAYER | jq -r '.player.uuid')

# Get Bedwars stats
curl -s "http://localhost:3000/api/bedwars/stats/$UUID" | jq '.fkdr'

# Get guild info
curl -s "http://localhost:3000/api/guild/player/$UUID" | jq '.guild.name'
```

---

### Example 4: Monitor Cache
```bash
# Check cache size
curl "http://localhost:3000/api/cache/stats" | jq '.cacheSize'

# Clear if needed
curl -X POST "http://localhost:3000/api/cache/clear"

# Verify empty
curl "http://localhost:3000/api/cache/stats" | jq '.cacheSize'
```

---

### Example 5: In TypeScript/JavaScript
```typescript
const baseURL = 'http://localhost:3000';

// Get player summary
const response = await fetch(`${baseURL}/api/summary/Technoblade`);
const data = await response.json();

console.log(`${data.username}: Level ${data.LVL}, Net Worth: ${data.NW}`);
```

---

## Response Time

### Without Cache
- First request: ~400-500ms (API call to Hypixel)

### With Cache
- Cache hit: ~1ms
- Cache miss: ~400-500ms

### Performance Example
```
100 identical requests:
Without cache: 40-50 seconds
With cache: ~0.4 seconds (99% faster!)
```

---

## Best Practices

✅ **Do**:
- Use cache for repeated requests
- Handle errors gracefully
- Check cache stats periodically
- Prune expired entries occasionally

❌ **Don't**:
- Make unnecessary API calls
- Bypass the cache for debugging
- Ignore error responses
- Make requests too frequently

---

## Endpoint Summary

| Method | Endpoint | Purpose | Cache |
|--------|----------|---------|-------|
| GET | `/stats/:ign` | Generate stats image | N/A |
| GET | `/bearer/:bearer` | Generate from token | N/A |
| GET | `/api/player/:username` | Player data by name | 5 min |
| GET | `/api/player/uuid/:uuid` | Player data by UUID | 5 min |
| GET | `/api/bedwars/stats/:uuid` | Bedwars stats | 5 min |
| GET | `/api/skyblock/profiles/:uuid` | Skyblock profiles | 5 min |
| GET | `/api/skyblock/profile/:id` | Profile details | 5 min |
| GET | `/api/guild/player/:uuid` | Guild by player | 5 min |
| GET | `/api/guild/name/:name` | Guild by name | 5 min |
| GET | `/api/summary/:username` | Player summary | 5 min |
| GET | `/api/summary/uuid/:uuid` | Summary by UUID | 5 min |
| GET | `/api/cache/stats` | Cache statistics | N/A |
| POST | `/api/cache/clear` | Clear cache | N/A |
| POST | `/api/cache/prune` | Prune expired | N/A |

---

## Support

For issues or questions:
1. Check `.env` contains `HYPIXEL_API_KEY`
2. Review error message in response
3. Check cache stats: `/api/cache/stats`
4. Clear cache if needed: `/api/cache/clear`

---

**Last Updated**: October 15, 2024
**API Version**: 1.0
**Status**: Production Ready
