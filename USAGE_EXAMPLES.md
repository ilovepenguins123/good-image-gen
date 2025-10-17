# Hypixel API Wrapper - Usage Examples

## Direct API Calls (Most Common)

### Example 1: Get Player Stats
```bash
curl "http://localhost:3000/api/player/Technoblade"
```

**Output**:
```json
{
  "success": true,
  "player": {
    "uuid": "99f00191e5fb47e8b8061afc906e7e77",
    "name": "Technoblade",
    "level": 175,
    "firstLogin": "2013-06-15T00:00:00Z",
    "lastLogin": "2024-10-15T12:30:00Z",
    "stats": { ... }
  }
}
```

---

### Example 2: Get and Cache Bedwars Stats

**First request** (API call):
```bash
curl "http://localhost:3000/api/bedwars/stats/99f00191e5fb47e8b8061afc906e7e77"
```
Time: ~400ms
Output: `[Cache SET]`

**Second request** (same UUID, cache hit):
```bash
curl "http://localhost:3000/api/bedwars/stats/99f00191e5fb47e8b8061afc906e7e77"
```
Time: ~1ms
Output: `[Cache HIT]`

---

### Example 3: Get Guild Information
```bash
curl "http://localhost:3000/api/guild/name/Hypixel"
```

**Output**:
```json
{
  "success": true,
  "guild": {
    "name": "Hypixel",
    "level": 50,
    "members": [ ... ],
    "tag": "Hypixel"
  }
}
```

---

### Example 4: Get All Skyblock Profiles
```bash
curl "http://localhost:3000/api/skyblock/profiles/99f00191e5fb47e8b8061afc906e7e77"
```

**Output**:
```json
{
  "success": true,
  "profiles": [
    {
      "profile_id": "abc123...",
      "cute_name": "Alchemy",
      "members": {
        "99f00191e5fb47e8b8061afc906e7e77": {
          "profile": {
            "levels": { ... },
            "networth": 9999999999
          }
        }
      }
    },
    {
      "profile_id": "def456...",
      "cute_name": "Combat",
      "members": { ... }
    }
  ]
}
```

---

## TypeScript/JavaScript Code Examples

### Example 5: Fetch Player in Code
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

const apiKey = process.env.HYPIXEL_API_KEY!;
const username = 'Technoblade';

try {
  const playerData = await hypixelWrapper.getPlayerStats(apiKey, username);

  if (playerData.success) {
    console.log(`Player: ${playerData.player.name}`);
    console.log(`Level: ${playerData.player.level}`);
    console.log(`UUID: ${playerData.player.uuid}`);
  }
} catch (error) {
  console.error('Failed to fetch player:', error);
}
```

---

### Example 6: Get Bedwars Stats
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

const apiKey = process.env.HYPIXEL_API_KEY!;
const uuid = '99f00191e5fb47e8b8061afc906e7e77';

const bedwarsStats = await hypixelWrapper.getBedwarsStats(apiKey, uuid);

if (bedwarsStats) {
  console.log(`Stars: ${bedwarsStats.level}`);
  console.log(`FKDR: ${bedwarsStats.fkdr?.toFixed(2)}`);
  console.log(`Wins: ${bedwarsStats.wins}`);
  console.log(`Kills: ${bedwarsStats.kills}`);
} else {
  console.log('No Bedwars stats found');
}
```

---

### Example 7: Pipeline - Get UUID, Then Get Stats
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

const apiKey = process.env.HYPIXEL_API_KEY!;

async function getPlayerBedwarsStats(username: string) {
  // Step 1: Get player UUID
  const playerData = await hypixelWrapper.getPlayerStats(apiKey, username);

  if (!playerData.success) {
    throw new Error('Player not found');
  }

  const uuid = playerData.player.uuid;
  console.log(`Found player: ${playerData.player.name} (${uuid})`);

  // Step 2: Get Bedwars stats using UUID (cached!)
  const bedwarsStats = await hypixelWrapper.getBedwarsStats(apiKey, uuid);

  return {
    playerName: playerData.player.name,
    uuid,
    bedwarsStats
  };
}

// Usage
const stats = await getPlayerBedwarsStats('Technoblade');
console.log(stats);
```

---

### Example 8: Monitor Cache
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

// Make some requests
await hypixelWrapper.getPlayerStats(apiKey, 'Technoblade');
await hypixelWrapper.getPlayerStats(apiKey, 'Dream');
await hypixelWrapper.getBedwarsStats(apiKey, 'uuid1');

// Check cache
const cacheStats = hypixelWrapper.getCacheStats();

console.log(`Cache entries: ${cacheStats.size}`);
cacheStats.entries.forEach(entry => {
  console.log(`  - ${entry}`);
});

// Prune expired entries
const removed = hypixelWrapper.pruneExpiredCache();
console.log(`Removed ${removed} expired entries`);

// Clear all cache
hypixelWrapper.clearCache();
```

---

### Example 9: Get Guild by Player UUID
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

const apiKey = process.env.HYPIXEL_API_KEY!;
const playerUUID = '99f00191e5fb47e8b8061afc906e7e77';

const guildData = await hypixelWrapper.getGuildByPlayer(apiKey, playerUUID);

if (guildData.success && guildData.guild) {
  console.log(`Guild: ${guildData.guild.name}`);
  console.log(`Level: ${guildData.guild.level}`);
  console.log(`Members: ${guildData.guild.members.length}`);
} else {
  console.log('Player is not in a guild');
}
```

---

### Example 10: Get Skyblock Stats
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

const apiKey = process.env.HYPIXEL_API_KEY!;
const playerUUID = '99f00191e5fb47e8b8061afc906e7e77';

const skyblockStats = await hypixelWrapper.getSkyblockStats(apiKey, playerUUID);

if (skyblockStats) {
  const memberData = skyblockStats.members[playerUUID];

  if (memberData) {
    const profile = memberData.profile;
    console.log(`Skyblock Level: ${profile.level}`);
    console.log(`Net Worth: ${profile.networth}`);
    console.log(`Catacombs: ${profile.catacombs}`);
  }
}
```

---

## Express Route Examples

### Example 11: Custom Endpoint Using Wrapper
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';
import express from 'express';

const router = express.Router();
const apiKey = process.env.HYPIXEL_API_KEY!;

// Custom endpoint that combines multiple data sources
router.get('/player-summary/:username', async (req, res) => {
  try {
    // Get player data
    const playerData = await hypixelWrapper.getPlayerStats(apiKey, req.params.username);

    if (!playerData.success) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const uuid = playerData.player.uuid;

    // Get Bedwars stats
    const bedwarsStats = await hypixelWrapper.getBedwarsStats(apiKey, uuid);

    // Get guild
    const guildData = await hypixelWrapper.getGuildByPlayer(apiKey, uuid);

    // Combine and return
    res.json({
      player: {
        name: playerData.player.name,
        uuid: playerData.player.uuid,
        level: playerData.player.level
      },
      bedwars: bedwarsStats,
      guild: guildData.guild || null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
```

---

### Example 12: Cache Status Endpoint
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';
import express from 'express';

const router = express.Router();

router.get('/stats/detailed', (req, res) => {
  const stats = hypixelWrapper.getCacheStats();

  res.json({
    cacheSize: stats.size,
    cacheDuration: '5 minutes',
    entries: stats.entries,
    timestamp: new Date().toISOString()
  });
});

router.post('/cache/clean', (req, res) => {
  const removed = hypixelWrapper.pruneExpiredCache();

  res.json({
    message: 'Cache pruned',
    removedEntries: removed,
    timestamp: new Date().toISOString()
  });
});
```

---

## Real-World Scenarios

### Scenario 1: Generate Image with Latest Player Data
```typescript
// The image generation endpoints already do this!
// GET /stats/Technoblade
//
// Internally:
// 1. Calls hypixelWrapper.getPlayerStats()
// 2. Gets UUID and all stats
// 3. Data is cached if not already
// 4. Image is generated with cached data
// 5. Future requests use cache (5 minutes)
```

### Scenario 2: Batch Player Lookup
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

const apiKey = process.env.HYPIXEL_API_KEY!;
const playernames = ['Technoblade', 'Dream', 'Philza', 'Wilbur'];

// Make multiple requests - cache helps!
const players = await Promise.all(
  playernames.map(name => hypixelWrapper.getPlayerStats(apiKey, name))
);

// Later, same requests use cache
const cachedPlayers = await Promise.all(
  playernames.map(name => hypixelWrapper.getPlayerStats(apiKey, name))
);

console.log('Second batch used cache (much faster)!');
```

### Scenario 3: Real-time Dashboard
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

const apiKey = process.env.HYPIXEL_API_KEY!;

async function updatePlayerDashboard(username: string) {
  // First render - gets data from API or cache
  const startTime = Date.now();

  const playerData = await hypixelWrapper.getPlayerStats(apiKey, username);
  const bedwarsStats = await hypixelWrapper.getBedwarsStats(apiKey, playerData.player.uuid);

  const elapsed = Date.now() - startTime;

  console.log(`Dashboard updated in ${elapsed}ms`);
  // First time: ~400ms (API call)
  // Subsequent: ~2ms (cache hits)
}

// Update every 10 seconds
setInterval(() => updatePlayerDashboard('Technoblade'), 10000);
```

### Scenario 4: Cache Warming
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

const apiKey = process.env.HYPIXEL_API_KEY!;

async function warmCache(playernames: string[]) {
  console.log(`Warming cache with ${playernames.length} players...`);

  for (const name of playernames) {
    try {
      await hypixelWrapper.getPlayerStats(apiKey, name);
      console.log(`Cached: ${name}`);
    } catch (error) {
      console.error(`Failed to cache ${name}`);
    }
  }

  // Check results
  const stats = hypixelWrapper.getCacheStats();
  console.log(`Cache now contains ${stats.size} entries`);
}

// Call on server startup
warmCache(['Technoblade', 'Dream', 'GeorgeNotFound']);
```

---

## Error Handling Examples

### Example 13: Graceful Error Handling
```typescript
import hypixelWrapper from './utils/hypixelWrapper.ts';

const apiKey = process.env.HYPIXEL_API_KEY!;

async function safeGetPlayer(username: string) {
  try {
    const data = await hypixelWrapper.getPlayerStats(apiKey, username);

    if (!data.success) {
      throw new Error(`API returned success: false`);
    }

    return data.player;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Player does not exist')) {
        console.error(`Player "${username}" not found`);
      } else if (error.message.includes('rate limited')) {
        console.error('Rate limited, please try again later');
      } else {
        console.error(`Error: ${error.message}`);
      }
    }

    return null;
  }
}

// Usage
const player = await safeGetPlayer('InvalidPlayer123');
if (!player) {
  console.log('Could not retrieve player');
}
```

---

## Performance Comparison

### Without Wrapper Cache
```typescript
// 10 requests for same player
for (let i = 0; i < 10; i++) {
  const response = await fetch(`https://api.hypixel.net/v2/player?key=${key}&name=Technoblade`);
  // 10 × 400ms = 4 seconds
  // 10 API calls
}
```

### With Wrapper Cache
```typescript
// 10 requests for same player
for (let i = 0; i < 10; i++) {
  const data = await hypixelWrapper.getPlayerStats(apiKey, 'Technoblade');
  // 1 × 400ms + 9 × 1ms = ~409ms
  // 1 API call
}
// 10x faster! 90% fewer API calls!
```

---

## Tips & Best Practices

### ✅ Do Use Cache
```typescript
// Good: Let cache handle repetition
await hypixelWrapper.getPlayerStats(apiKey, 'Technoblade');
await hypixelWrapper.getPlayerStats(apiKey, 'Technoblade'); // Uses cache
```

### ❌ Don't Bypass Cache
```typescript
// Avoid: Calling fetch directly bypasses cache
const response = await fetch('https://api.hypixel.net/v2/player...');
```

### ✅ Do Check Cache Stats
```typescript
// Good: Monitor cache usage
const stats = hypixelWrapper.getCacheStats();
console.log(`Using ${stats.size} cache entries`);
```

### ✅ Do Handle Errors
```typescript
// Good: Catch and handle errors
try {
  const data = await hypixelWrapper.getPlayerStats(apiKey, username);
} catch (error) {
  console.error('Failed to fetch:', error);
}
```

### ✅ Do Prune Cache Periodically
```typescript
// Good: Clean up expired entries
setInterval(() => {
  hypixelWrapper.pruneExpiredCache();
}, 60000); // Every minute
```

---

## Summary

The wrapper makes it easy to:
- ✅ Get player data with simple function calls
- ✅ Automatically cache responses for 5 minutes
- ✅ Monitor and manage cache
- ✅ Build features on top of cached data
- ✅ Handle errors gracefully
- ✅ Improve performance dramatically

**Start using it now!** Pick any example above and run it.
