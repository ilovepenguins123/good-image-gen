# Hypixel API Wrapper Guide

## Overview

The Hypixel API Wrapper (`utils/hypixelWrapper.ts`) provides a simple, cached interface to the Hypixel API. All requests are cached for **5 minutes** to reduce API calls and improve performance.

## Features

- **5-minute automatic caching** - Reduces API calls and improves response times
- **Multiple data endpoints** - Player stats, Bedwars, Skyblock, Guild, etc.
- **Cache management** - View stats, clear cache, prune expired entries
- **Error handling** - Graceful error messages and logging
- **RESTful API** - All endpoints accessible via HTTP

## Running the Server

```bash
bun run index.ts
```

The server will start on `http://localhost:3000`

## API Endpoints

### Player Endpoints

#### Get Player Stats by Username
```
GET /api/player/:username
```

**Example:**
```bash
curl "http://localhost:3000/api/player/Technoblade"
```

**Response:**
```json
{
  "success": true,
  "player": {
    "uuid": "99f...",
    "name": "Technoblade",
    "level": 175,
    "stats": { ... }
  }
}
```

#### Get Player Stats by UUID
```
GET /api/player/uuid/:uuid
```

**Example:**
```bash
curl "http://localhost:3000/api/player/uuid/99f00191e5fb47e8b8061afc906e7e77"
```

### Bedwars Endpoints

#### Get Bedwars Stats
```
GET /api/bedwars/stats/:uuid
```

**Example:**
```bash
curl "http://localhost:3000/api/bedwars/stats/99f00191e5fb47e8b8061afc906e7e77"
```

**Response:**
```json
{
  "level": 1234,
  "fkdr": 5.67,
  "wins": 8900,
  "winstreak": 45,
  "kills": 23456,
  "deaths": 4123
}
```

### Skyblock Endpoints

#### Get Skyblock Profiles
```
GET /api/skyblock/profiles/:uuid
```

**Example:**
```bash
curl "http://localhost:3000/api/skyblock/profiles/99f00191e5fb47e8b8061afc906e7e77"
```

**Response:**
```json
{
  "success": true,
  "profiles": [
    {
      "profile_id": "abc123...",
      "cute_name": "Alchemy",
      "members": { ... }
    },
    { ... }
  ]
}
```

#### Get Specific Skyblock Profile
```
GET /api/skyblock/profile/:profileId
```

**Example:**
```bash
curl "http://localhost:3000/api/skyblock/profile/abc123def456ghi789"
```

### Guild Endpoints

#### Get Guild by Player UUID
```
GET /api/guild/player/:uuid
```

**Example:**
```bash
curl "http://localhost:3000/api/guild/player/99f00191e5fb47e8b8061afc906e7e77"
```

#### Get Guild by Name
```
GET /api/guild/name/:guildName
```

**Example:**
```bash
curl "http://localhost:3000/api/guild/name/Hypixel"
```

### Cache Management Endpoints

#### View Cache Statistics
```
GET /api/cache/stats
```

**Example:**
```bash
curl "http://localhost:3000/api/cache/stats"
```

**Response:**
```json
{
  "cacheSize": 12,
  "cacheDuration": "5 minutes",
  "entries": [
    "player:key=xxx&name=Technoblade (298s remaining)",
    "bedwars:key=xxx&uuid=99f... (245s remaining)"
  ]
}
```

#### Clear All Cache
```
POST /api/cache/clear
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/cache/clear"
```

#### Prune Expired Cache Entries
```
POST /api/cache/prune
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/cache/prune"
```

## Using the Wrapper in Code

### Import the Wrapper

```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';
```

### Get Player Stats

```typescript
const apiKey = process.env.HYPIXEL_API_KEY;
const playerData = await hypixelWrapper.getPlayerStats(apiKey, 'Technoblade');
console.log(playerData.player.level);
```

### Get Bedwars Stats

```typescript
const bedwarsStats = await hypixelWrapper.getBedwarsStats(apiKey, 'uuid-here');
console.log(`FKDR: ${bedwarsStats.fkdr}`);
```

### Get Skyblock Stats

```typescript
const skyblockStats = await hypixelWrapper.getSkyblockStats(apiKey, 'uuid-here');
console.log(`Sky Block Level: ${skyblockStats.members[uuid].profile.stats.level}`);
```

### Get Guild Info

```typescript
const guild = await hypixelWrapper.getGuildByName(apiKey, 'My Guild');
console.log(`Guild Level: ${guild.guild.level}`);
```

### Manage Cache in Code

```typescript
// Get cache statistics
const stats = hypixelWrapper.getCacheStats();
console.log(`${stats.size} items in cache`);

// Clear all cache
hypixelWrapper.clearCache();

// Remove expired entries
const removed = hypixelWrapper.pruneExpiredCache();
console.log(`Removed ${removed} expired entries`);
```

## Image Generation Integration

The image generation endpoints (`/stats/:ign` and `/bearer/:bearer`) now use the cached wrapper internally:

```bash
# Generate stats image (uses cache if available)
curl "http://localhost:3000/stats/Technoblade?watermark=MyWatermark" \
  -o player_stats.png

# Generate from bearer token
curl "http://localhost:3000/bearer/your-bearer-token" \
  -o player_stats.png
```

Both endpoints automatically:
1. Check the cache for player data
2. Use cached data if available (within 5 minutes)
3. Call Hypixel API if cache is empty or expired
4. Store results in cache for future requests

## Cache Behavior

### How Caching Works

1. **First Request**: API call is made, data is cached with timestamp
2. **Subsequent Requests** (< 5 min): Cached data is returned immediately
3. **After 5 Minutes**: Cache expires, new API call is made
4. **Log Output**:
   - `[Cache HIT]` - Data returned from cache
   - `[Cache SET]` - Data stored in cache
   - `[Cache CLEARED]` - Cache manually cleared

### Example Cache Flow

```
Request 1: GET /api/player/Technoblade
  → [Cache MISS] API call made
  → [Cache SET] player:name=Technoblade (expires in 300s)
  → Response returned

Request 2: GET /api/player/Technoblade (within 5 min)
  → [Cache HIT] player:name=Technoblade
  → Cached response returned (instant)

Request 3: GET /api/player/Technoblade (after 5 min)
  → [Cache MISS] Cache expired
  → API call made
  → [Cache SET] player:name=Technoblade (expires in 300s)
  → Response returned
```

## Environment Setup

Ensure your `.env` file contains:

```
HYPIXEL_API_KEY=your_api_key_here
```

Get a free API key from: https://developer.hypixel.net/

## Error Handling

The wrapper handles errors gracefully:

```typescript
try {
  const data = await hypixelWrapper.getPlayerStats(apiKey, username);
} catch (error) {
  console.error('Failed to fetch player:', error.message);
  // Returns: "Hypixel API Error: [cause]" or "API Error: [HTTP status]"
}
```

Common errors:
- `API Error: 429 Too Many Requests` - Rate limited, wait and retry
- `Hypixel API Error: Invalid API key` - Check HYPIXEL_API_KEY
- `Hypixel API Error: Player does not exist` - Username/UUID not found

## Performance Benefits

### Without Caching (5 API calls to Hypixel)
- 5 requests × 300-500ms average = 1.5-2.5 seconds
- 5 API rate limit hits

### With Caching (1 API call, 4 cache hits)
- 1 request × 400ms + 4 cache hits × 1ms = ~404ms
- Only 1 API rate limit hit
- **5-6x faster** and **80% fewer API calls**

## Advanced: Custom Cache Keys

The wrapper automatically generates cache keys with this format:
```
{endpoint}:key={apiKey}&{param1}={value1}&{param2}={value2}
```

Example keys:
- `player:key=xxx&name=Technoblade`
- `bedwars:key=xxx&uuid=99f...`
- `guild:key=xxx&player=99f...`

## Tips & Tricks

1. **Clear cache before development**: `curl -X POST http://localhost:3000/api/cache/clear`
2. **Monitor cache**: `curl http://localhost:3000/api/cache/stats`
3. **Batch requests**: Make multiple calls quickly to benefit from cache
4. **Manual cleanup**: Run prune periodically: `curl -X POST http://localhost:3000/api/cache/prune`

## Rate Limiting

Hypixel API limits to 120 requests per minute. With 5-minute caching, a single player's stats can be requested repeatedly with only 1 API call per 5 minutes.

For 100 concurrent users requesting the same player:
- **Without cache**: 100 requests/5min = 20 req/min (within limit)
- **With cache**: 1 request/5min = 0.2 req/min (minimal impact)
