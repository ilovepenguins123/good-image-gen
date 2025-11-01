# API Endpoints Summary

## Server Info
- **Host**: `http://localhost:3000`
- **Port**: 3000
- **Runtime**: Bun
- **Start**: `bun run index.ts`

---

## Wrapper Endpoints (NEW)

All wrapper endpoints include automatic **5-minute caching**.

### Player Endpoints

#### `GET /api/player/:username`
Get player stats by username
```bash
curl "http://localhost:3000/api/player/Technoblade"
```
**Response**: `{ success: true, player: {...} }`

#### `GET /api/player/uuid/:uuid`
Get player stats by UUID
```bash
curl "http://localhost:3000/api/player/uuid/99f00191e5fb47e8b8061afc906e7e77"
```
**Response**: `{ success: true, player: {...} }`

---

### Bedwars Endpoints

#### `GET /api/bedwars/stats/:uuid`
Get Bedwars stats for a player
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
  "winstreak": 45
}
```

---

### Skyblock Endpoints

#### `GET /api/skyblock/profiles/:uuid`
Get all Skyblock profiles for a player
```bash
curl "http://localhost:3000/api/skyblock/profiles/99f00191e5fb47e8b8061afc906e7e77"
```
**Response**: `{ success: true, profiles: [...] }`

#### `GET /api/skyblock/profile/:profileId`
Get specific Skyblock profile details
```bash
curl "http://localhost:3000/api/skyblock/profile/abc123def456ghi789"
```
**Response**: `{ success: true, profile: {...} }`

---

### Guild Endpoints

#### `GET /api/guild/player/:uuid`
Get guild by player UUID
```bash
curl "http://localhost:3000/api/guild/player/99f00191e5fb47e8b8061afc906e7e77"
```
**Response**: `{ success: true, guild: {...} }`

#### `GET /api/guild/name/:guildName`
Get guild by name
```bash
curl "http://localhost:3000/api/guild/name/Hypixel"
```
**Response**: `{ success: true, guild: {...} }`

---

### Summary Endpoints

#### `GET /api/summary/:username`
Get player summary data (Rank, NWL, Gifted, NW, UnsoulboundNW, SoulboundNW, SA, LVL, Catacombs, CoopMembers)
```bash
curl "http://localhost:3000/api/summary/Technoblade"
```
**Response**:
```json
{
  "username": "Technoblade",
  "Rank": "PIG+++",
  "NWL": 123.45,
  "Gifted": 5,
  "NW": 1234567890,
  "UnsoulboundNW": 1200000000,
  "SoulboundNW": 34567890,
  "SA": "52.43",
  "LVL": 234,
  "Catacombs": 42,
  "CoopMembers": 3
}
```

#### `GET /api/summary/uuid/:uuid`
Get player summary data by UUID
```bash
curl "http://localhost:3000/api/summary/uuid/99f00191e5fb47e8b8061afc906e7e77"
```
**Response**: Same as above, plus `uuid` field and formatted networth values

---

## Mojang API Endpoints (NEW)

### UUID Lookup Endpoints

#### `GET /api/mojang/uuid/:username`
Get UUID from Minecraft username
```bash
curl "http://localhost:3000/api/mojang/uuid/Technoblade"
```
**Response**:
```json
{
  "username": "Technoblade",
  "uuid": "99f00191e5fb47e8b8061afc906e7e77",
  "formatted_uuid": "99f00191-e5fb-47e8-b806-1afc906e7e77"
}
```

#### `GET /api/mojang/username/:uuid`
Get current username from UUID
```bash
curl "http://localhost:3000/api/mojang/username/99f00191e5fb47e8b8061afc906e7e77"
```
**Response**:
```json
{
  "uuid": "99f00191e5fb47e8b8061afc906e7e77",
  "username": "Technoblade",
  "formatted_uuid": "99f00191-e5fb-47e8-b806-1afc906e7e77"
}
```

#### `GET /api/mojang/history/:uuid`
Get username history for a UUID
```bash
curl "http://localhost:3000/api/mojang/history/99f00191e5fb47e8b8061afc906e7e77"
```
**Response**:
```json
{
  "uuid": "99f00191e5fb47e8b8061afc906e7e77",
  "formatted_uuid": "99f00191-e5fb-47e8-b806-1afc906e7e77",
  "name_history": [
    {"name": "Technoblade"}
  ]
}
```

#### `GET /api/mojang/profile/:uuid`
Get full profile information including skin data
```bash
curl "http://localhost:3000/api/mojang/profile/99f00191e5fb47e8b8061afc906e7e77"
```
**Response**:
```json
{
  "uuid": "99f00191e5fb47e8b8061afc906e7e77",
  "username": "Technoblade",
  "formatted_uuid": "99f00191-e5fb-47e8-b806-1afc906e7e77",
  "properties": [...],
  "skin_data": {
    "textures": {
      "SKIN": {
        "url": "http://textures.minecraft.net/texture/..."
      }
    }
  }
}
```

#### `POST /api/mojang/bulk/uuids`
Get UUIDs for multiple usernames (max 10 per request)
```bash
curl -X POST "http://localhost:3000/api/mojang/bulk/uuids" \
  -H "Content-Type: application/json" \
  -d '{"usernames": ["Technoblade", "Notch", "Hypixel"]}'
```
**Request Body**:
```json
{
  "usernames": ["Technoblade", "Notch", "Hypixel"]
}
```
**Response**:
```json
{
  "requested": ["Technoblade", "Notch", "Hypixel"],
  "found": [
    {
      "username": "Technoblade",
      "uuid": "99f00191e5fb47e8b8061afc906e7e77",
      "formatted_uuid": "99f00191-e5fb-47e8-b806-1afc906e7e77"
    },
    {
      "username": "Notch",
      "uuid": "069a79f444e94726a5befca90e38aaf5",
      "formatted_uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5"
    }
  ]
}
```

---

### Cache Management Endpoints

#### `GET /api/cache/stats`
View current cache statistics
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
    "bedwars:key=xxx&uuid=99f... (245s remaining)"
  ]
}
```

#### `POST /api/cache/clear`
Clear all cached entries
```bash
curl -X POST "http://localhost:3000/api/cache/clear"
```
**Response**: `{ message: "Cache cleared successfully" }`

#### `POST /api/cache/prune`
Remove expired cache entries
```bash
curl -X POST "http://localhost:3000/api/cache/prune"
```
**Response**: `{ message: "Removed 2 expired entries" }`

---

## Image Generation Endpoints (EXISTING, now with cache)

#### `GET /stats/:ign`
Generate stats image by player IGN
```bash
curl "http://localhost:3000/stats/Technoblade?watermark=MyWatermark&censor=false" -o stats.png
```
**Parameters**:
- `watermark` (optional): Text to add to image
- `censor` (optional): true/false to censor player names

**Response**: Gzip-compressed PNG image

#### `GET /bearer/:bearer`
Generate stats image by bearer token
```bash
curl "http://localhost:3000/bearer/your-bearer-token" -o stats.png
```
**Parameters**:
- `watermark` (optional): Text to add to image
- `censor` (optional): true/false to censor player names

**Response**: Gzip-compressed PNG image

---

## Response Format

### Success Response
```json
{
  "success": true,
  "player": {
    "uuid": "...",
    "name": "...",
    // ... data
  }
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Request successful |
| 400 | Missing or invalid parameters |
| 404 | Player/guild/UUID not found |
| 429 | Rate limited by Hypixel API |
| 500 | Server error, API key not configured, or Mojang API error |

---

## Cache Behavior

All Hypixel API endpoints (`/api/*`) automatically cache responses for **5 minutes**.

**Cache Keys Format**:
```
endpoint:key=API_KEY&param1=value1&param2=value2
```

**Examples**:
- `player:key=xxx&name=Technoblade`
- `bedwars:key=xxx&uuid=99f...`
- `guild:key=xxx&player=99f...`

**Log Output**:
- `[Cache HIT]` - Data from cache (1ms)
- `[Cache SET]` - Data stored in cache
- `[Cache CLEARED]` - Manual clear executed
- `[Cache PRUNED]` - Expired entries removed

---

## Usage Examples

### Example 1: Get and Cache Player Data
```bash
# First call - hits API
curl "http://localhost:3000/api/player/Technoblade"

# Second call (within 5 min) - hits cache instantly
curl "http://localhost:3000/api/player/Technoblade"

# Check cache
curl "http://localhost:3000/api/cache/stats"
```

### Example 2: Get Player UUID, Then Bedwars Stats
```bash
# Get player UUID
PLAYER_DATA=$(curl -s "http://localhost:3000/api/player/Technoblade")
UUID=$(echo $PLAYER_DATA | jq -r '.player.uuid')

# Get Bedwars stats using UUID
curl "http://localhost:3000/api/bedwars/stats/$UUID"
```

### Example 3: Generate Stats Image with Cache
```bash
# Generate image (uses cache internally)
curl "http://localhost:3000/stats/Technoblade?watermark=Generated%20on%20$(date +%Y-%m-%d)" -o stats.png

# Image was generated using cached Hypixel data
```

### Example 4: Monitor and Clear Cache
```bash
# Check cache size
curl "http://localhost:3000/api/cache/stats"

# Clear cache
curl -X POST "http://localhost:3000/api/cache/clear"

# Verify cache is empty
curl "http://localhost:3000/api/cache/stats"
```

### Example 5: Get UUID from Username, Then Hypixel Data
```bash
# Get UUID from Mojang API
MOJANG_DATA=$(curl -s "http://localhost:3000/api/mojang/uuid/Technoblade")
UUID=$(echo $MOJANG_DATA | jq -r '.uuid')

# Use UUID to get Hypixel player data
curl "http://localhost:3000/api/player/uuid/$UUID"

# Get Bedwars stats using the same UUID
curl "http://localhost:3000/api/bedwars/stats/$UUID"
```

### Example 6: Bulk UUID Lookup
```bash
# Get UUIDs for multiple players at once
curl -X POST "http://localhost:3000/api/mojang/bulk/uuids" \
  -H "Content-Type: application/json" \
  -d '{"usernames": ["Technoblade", "Notch", "Hypixel", "jeb_"]}'
```

### Example 7: Check Username History
```bash
# Get current username from UUID
curl "http://localhost:3000/api/mojang/username/069a79f444e94726a5befca90e38aaf5"

# Get full username history
curl "http://localhost:3000/api/mojang/history/069a79f444e94726a5befca90e38aaf5"
```

---

## Error Handling

### Common Errors

**Missing API Key**
```json
{
  "error": "HYPIXEL_API_KEY not configured"
}
```
Fix: Add `HYPIXEL_API_KEY` to `.env`

**Invalid Player**
```json
{
  "error": "Hypixel API Error: Player does not exist"
}
```
Fix: Check player name/UUID is correct

**Rate Limited**
```json
{
  "error": "Hypixel API Error: You are being rate limited"
}
```
Fix: Wait or use cache, adjust request frequency

**Missing Parameter**
```json
{
  "error": "Missing uuid parameter"
}
```
Fix: Provide required URL parameter

**Mojang API Errors**
```json
{
  "error": "Player not found"
}
```
Fix: Check that the username/UUID exists

**Invalid Bulk Request**
```json
{
  "error": "Maximum 10 usernames allowed per request"
}
```
Fix: Reduce the number of usernames in the request

---

## Performance Notes

### Without Cache
- 100 identical requests = 100 API calls
- 30-50+ seconds total
- Heavy rate limiting

### With 5-Minute Cache
- 100 identical requests = 1 API call
- ~100ms total for cache hits
- Minimal rate limiting

**Benefit**: 99% fewer API calls, 300-500x faster!

---

## Testing

Test all endpoints with provided script:
```bash
chmod +x test_wrapper.sh
./test_wrapper.sh
```

---

## File Locations

| File | Purpose |
|------|---------|
| `utils/hypixelWrapper.ts` | Main wrapper module |
| `index.ts` | Express routes (wrapper endpoints) |
| `HYPIXEL_WRAPPER_GUIDE.md` | Complete documentation |
| `WRAPPER_QUICKSTART.md` | Quick start guide |
| `test_wrapper.sh` | Test script |
| `.env` | Configuration (must contain HYPIXEL_API_KEY) |
