/**
 * Hypixel API Wrapper with 5-minute caching
 * Provides methods to fetch Hypixel player data with automatic caching
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cache: CacheStore = {};

/**
 * Generate a cache key based on endpoint and parameters
 */
function getCacheKey(endpoint: string, params: Record<string, any>): string {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${endpoint}:${paramString}`;
}

/**
 * Get cached data if it exists and hasn't expired
 */
function getFromCache(key: string): any | null {
  const entry = cache[key];
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    delete cache[key];
    return null;
  }

  console.log(`[Cache HIT] ${key}`);
  return entry.data;
}

/**
 * Store data in cache
 */
function setCache(key: string, data: any): void {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
  console.log(`[Cache SET] ${key} (expires in ${CACHE_DURATION / 1000}s)`);
}

/**
 * Make an API request with caching
 */
async function makeRequest(url: string, cacheKey: string): Promise<any> {
  // Check cache first
  const cachedData = getFromCache(cacheKey);
  if (cachedData !== null) {
    return cachedData;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success === false) {
      throw new Error(`Hypixel API Error: ${data.cause || 'Unknown error'}`);
    }

    // Cache successful responses
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`[API Error] ${cacheKey}:`, error);
    throw error;
  }
}

/**
 * Fetch player stats from Hypixel API
 */
export async function getPlayerStats(apiKey: string, username: string): Promise<any> {
  const endpoint = 'player';
  const params = { key: apiKey, name: username };
  const cacheKey = getCacheKey(endpoint, params);

  const url = `https://api.hypixel.net/v2/player?key=${apiKey}&name=${username}`;
  return makeRequest(url, cacheKey);
}

/**
 * Fetch player by UUID
 */
export async function getPlayerByUUID(apiKey: string, uuid: string): Promise<any> {
  const endpoint = 'playerUUID';
  const params = { key: apiKey, uuid };
  const cacheKey = getCacheKey(endpoint, params);

  const url = `https://api.hypixel.net/v2/player?key=${apiKey}&uuid=${uuid}`;
  return makeRequest(url, cacheKey);
}

/**
 * Fetch Skyblock profiles for a player
 */
export async function getSkyblockProfiles(apiKey: string, uuid: string): Promise<any> {
  const endpoint = 'skyblockProfiles';
  const params = { key: apiKey, uuid };
  const cacheKey = getCacheKey(endpoint, params);

  const url = `https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`;
  return makeRequest(url, cacheKey);
}

/**
 * Fetch specific Skyblock profile details
 */
export async function getSkyblockProfile(apiKey: string, profileId: string): Promise<any> {
  const endpoint = 'skyblockProfile';
  const params = { key: apiKey, profile_id: profileId };
  const cacheKey = getCacheKey(endpoint, params);

  const url = `https://api.hypixel.net/v2/skyblock/profile?key=${apiKey}&profile=${profileId}`;
  return makeRequest(url, cacheKey);
}

/**
 * Fetch Skyblock museum data
 */
export async function getSkyblockMuseum(apiKey: string, profileId: string): Promise<any> {
  const endpoint = 'skyblockMuseum';
  const params = { key: apiKey, profile_id: profileId };
  const cacheKey = getCacheKey(endpoint, params);

  const url = `https://api.hypixel.net/v2/skyblock/museum?profile=${profileId}&key=${apiKey}`;
  return makeRequest(url, cacheKey);
}

/**
 * Fetch guild information by name
 */
export async function getGuildByName(apiKey: string, guildName: string): Promise<any> {
  const endpoint = 'guildByName';
  const params = { key: apiKey, name: guildName };
  const cacheKey = getCacheKey(endpoint, params);

  const url = `https://api.hypixel.net/v2/guild?key=${apiKey}&name=${guildName}`;
  return makeRequest(url, cacheKey);
}

/**
 * Fetch guild information by player UUID
 */
export async function getGuildByPlayer(apiKey: string, uuid: string): Promise<any> {
  const endpoint = 'guildByPlayer';
  const params = { key: apiKey, player: uuid };
  const cacheKey = getCacheKey(endpoint, params);

  const url = `https://api.hypixel.net/v2/guild?key=${apiKey}&player=${uuid}`;
  return makeRequest(url, cacheKey);
}

/**
 * Fetch player achievements
 */
export async function getAchievements(apiKey: string, uuid: string): Promise<any> {
  const endpoint = 'achievements';
  const params = { key: apiKey, uuid };
  const cacheKey = getCacheKey(endpoint, params);

  const url = `https://api.hypixel.net/v2/achievements?key=${apiKey}&uuid=${uuid}`;
  return makeRequest(url, cacheKey);
}

/**
 * Fetch Bedwars stats specifically
 */
export async function getBedwarsStats(apiKey: string, uuid: string): Promise<any> {
  const playerData = await getPlayerByUUID(apiKey, uuid);
  return playerData?.player?.stats?.Bedwars || null;
}

/**
 * Fetch Skyblock stats specifically
 */
export async function getSkyblockStats(apiKey: string, uuid: string): Promise<any> {
  const profiles = await getSkyblockProfiles(apiKey, uuid);
  if (!profiles?.profiles) return null;

  // Return the profile with highest skyblock level or latest updated
  let bestProfile = profiles.profiles[0];
  for (const profile of profiles.profiles) {
    if (profile.members && profile.members[uuid]) {
      bestProfile = profile;
      break;
    }
  }

  return bestProfile;
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  const count = Object.keys(cache).length;
  cache = {};
  console.log(`[Cache CLEARED] Removed ${count} entries`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  const entries = Object.keys(cache).map(key => {
    const entry = cache[key];
    const age = Date.now() - entry.timestamp;
    const remaining = CACHE_DURATION - age;
    return `${key} (${Math.round(remaining / 1000)}s remaining)`;
  });

  return {
    size: entries.length,
    entries
  };
}

/**
 * Manual cache expiry - removes old entries
 */
export function pruneExpiredCache(): number {
  const now = Date.now();
  let removed = 0;

  for (const key in cache) {
    const entry = cache[key];
    if (now - entry.timestamp > CACHE_DURATION) {
      delete cache[key];
      removed++;
    }
  }

  if (removed > 0) {
    console.log(`[Cache PRUNED] Removed ${removed} expired entries`);
  }

  return removed;
}

export default {
  getPlayerStats,
  getPlayerByUUID,
  getSkyblockProfiles,
  getSkyblockProfile,
  getSkyblockMuseum,
  getGuildByName,
  getGuildByPlayer,
  getAchievements,
  getBedwarsStats,
  getSkyblockStats,
  clearCache,
  getCacheStats,
  pruneExpiredCache
};
