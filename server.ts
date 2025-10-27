import express from 'express';
import * as fs from 'node:fs';
import { gzipSync } from 'node:zlib';
import hypixelWrapper from './utils/hypixelWrapper.ts';
import fetchAllStats from './utils/fetch/all.ts';
import getBearerIGN from './utils/BearerIGN.ts';
import { formatNetWorth } from './utils/Format.ts';
import { generateBubbleImage } from './imageGenerator.ts';

const app = express();
const port = process.env.PORT || 3000;

// ============ HYPIXEL API WRAPPER ENDPOINTS ============

/**
 * GET /api/player/:username
 * Fetch player stats by username
 */
app.get("/api/player/:username", async (req: any, res: any) => {
  const { username } = req.params;
  const apiKey = process.env.HYPIXEL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "HYPIXEL_API_KEY not configured" });
  }

  if (!username) {
    return res.status(400).json({ error: "Missing username parameter" });
  }

  try {
    const data = await hypixelWrapper.getPlayerStats(apiKey, username);
    res.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/player/uuid/:uuid
 * Fetch player stats by UUID
 */
app.get("/api/player/uuid/:uuid", async (req: any, res: any) => {
  const { uuid } = req.params;
  const apiKey = process.env.HYPIXEL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "HYPIXEL_API_KEY not configured" });
  }

  if (!uuid) {
    return res.status(400).json({ error: "Missing uuid parameter" });
  }

  try {
    const data = await hypixelWrapper.getPlayerByUUID(apiKey, uuid);
    res.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/bedwars/stats/:uuid
 * Fetch Bedwars stats for a player
 */
app.get("/api/bedwars/stats/:uuid", async (req: any, res: any) => {
  const { uuid } = req.params;
  const apiKey = process.env.HYPIXEL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "HYPIXEL_API_KEY not configured" });
  }

  if (!uuid) {
    return res.status(400).json({ error: "Missing uuid parameter" });
  }

  try {
    const data = await hypixelWrapper.getBedwarsStats(apiKey, uuid);
    res.json(data || { message: "No Bedwars stats found" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/skyblock/profiles/:uuid
 * Fetch Skyblock profiles for a player
 */
app.get("/api/skyblock/profiles/:uuid", async (req: any, res: any) => {
  const { uuid } = req.params;
  const apiKey = process.env.HYPIXEL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "HYPIXEL_API_KEY not configured" });
  }

  if (!uuid) {
    return res.status(400).json({ error: "Missing uuid parameter" });
  }

  try {
    const data = await hypixelWrapper.getSkyblockProfiles(apiKey, uuid);
    res.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/skyblock/profile/:profileId
 * Fetch specific Skyblock profile details
 */
app.get("/api/skyblock/profile/:profileId", async (req: any, res: any) => {
  const { profileId } = req.params;
  const apiKey = process.env.HYPIXEL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "HYPIXEL_API_KEY not configured" });
  }

  if (!profileId) {
    return res.status(400).json({ error: "Missing profileId parameter" });
  }

  try {
    const data = await hypixelWrapper.getSkyblockProfile(apiKey, profileId);
    res.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/guild/player/:uuid
 * Fetch guild information by player UUID
 */
app.get("/api/guild/player/:uuid", async (req: any, res: any) => {
  const { uuid } = req.params;
  const apiKey = process.env.HYPIXEL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "HYPIXEL_API_KEY not configured" });
  }

  if (!uuid) {
    return res.status(400).json({ error: "Missing uuid parameter" });
  }

  try {
    const data = await hypixelWrapper.getGuildByPlayer(apiKey, uuid);
    res.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/guild/name/:guildName
 * Fetch guild information by name
 */
app.get("/api/guild/name/:guildName", async (req: any, res: any) => {
  const { guildName } = req.params;
  const apiKey = process.env.HYPIXEL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "HYPIXEL_API_KEY not configured" });
  }

  if (!guildName) {
    return res.status(400).json({ error: "Missing guildName parameter" });
  }

  try {
    const data = await hypixelWrapper.getGuildByName(apiKey, guildName);
    res.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
app.get("/api/cache/stats", (req: any, res: any) => {
  const stats = hypixelWrapper.getCacheStats();
  res.json({
    cacheSize: stats.size,
    cacheDuration: "5 minutes",
    entries: stats.entries
  });
});

/**
 * POST /api/cache/clear
 * Clear all cache
 */
app.post("/api/cache/clear", (req: any, res: any) => {
  hypixelWrapper.clearCache();
  res.json({ message: "Cache cleared successfully" });
});

/**
 * POST /api/cache/prune
 * Remove expired cache entries
 */
app.post("/api/cache/prune", (req: any, res: any) => {
  const removed = hypixelWrapper.pruneExpiredCache();
  res.json({ message: `Removed ${removed} expired entries` });
});

/**
 * GET /api/summary/:username
 * Get player summary data (Rank, NWL, Gifted, NW, SA, LVL)
 */
app.get("/api/summary/:username", async (req: any, res: any) => {
  const { username } = req.params;
  const apiKey = process.env.HYPIXEL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "HYPIXEL_API_KEY not configured" });
  }

  if (!username) {
    return res.status(400).json({ error: "Missing username parameter" });
  }

  try {
    // Get all player stats
    const statsData = await fetchAllStats(apiKey, username, "", undefined);
    const { generalstats, sbstats } = statsData;

    // Extract rank
    const rank = (generalstats as any)?.rank?.rank || "None";

    // Extract Skyblock stats
    const nwl = (sbstats as any)?.skyblockLevel || 0;
    const nw = (sbstats as any)?.networth || 0;
    const sa = (sbstats as any)?.skillAverageWithProgress || 0;

    // Extract gifted ranks
    const gifted = (generalstats as any)?.ranksgifted || 0;

    // Extract network level
    const lvl = (generalstats as any)?.leveling?.level || 0;

    res.json({
      username,
      Rank: rank,
      NWL: nwl,
      Gifted: gifted,
      NW: nw,
      SA: sa.toFixed(2),
      LVL: lvl
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/summary/uuid/:uuid
 * Get player summary data by UUID
 */
app.get("/api/summary/uuid/:uuid", async (req: any, res: any) => {
  const { uuid } = req.params;
  const apiKey = process.env.HYPIXEL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "HYPIXEL_API_KEY not configured" });
  }

  if (!uuid) {
    return res.status(400).json({ error: "Missing uuid parameter" });
  }

  try {
    // Get player data by UUID first
    const playerData = await hypixelWrapper.getPlayerByUUID(apiKey, uuid);
    if (!playerData.success) {
      return res.status(404).json({ error: "Player not found" });
    }

    const username = playerData.player.name;

    // Get all player stats
    const statsData = await fetchAllStats(apiKey, username, "", uuid);
    const { generalstats, sbstats } = statsData;

    // Extract rank
    const rank = (generalstats as any)?.rank?.rank || "None";

    // Extract Skyblock stats
    const nwl = (sbstats as any)?.skyblockLevel || 0;
    const nw = (sbstats as any)?.networth || 0;
    const sa = (sbstats as any)?.skillAverageWithProgress || 0;

    // Extract gifted ranks
    const gifted = (generalstats as any)?.ranksgifted || 0;

    // Extract network level
    const lvl = (generalstats as any)?.leveling?.level || 0;

    res.json({
      username,
      uuid,
      Rank: rank,
      NWL: nwl,
      Gifted: gifted,
      NW: formatNetWorth(nw),
      SA: sa.toFixed(2),
      LVL: lvl
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

// ============ IMAGE GENERATION ENDPOINTS ============

app.get("/bearer/:bearer", async (req: any, res: any) => {
  const bearer = req.params.bearer;
  if (!bearer) {
    return res.status(400).send("Missing bearer parameter");
  }

  const watermark = req.query.watermark as string || "";
  const censor = req.query.censor?.toString().toLowerCase() === "true" || false;
  const resolution = "1920x1080";
  const [width, height] = resolution.split("x").map(Number);

  if (!width || !height || width < 100 || height < 100) {
    return res.status(400).send("Invalid resolution");
  }

  try {
    console.log(`Generating image for bearer token...`);
    const backgroundFiles = fs.readdirSync('./backgrounds');
    if (!backgroundFiles.length) {
      throw new Error("No background files found");
    }
    const randomBackground = `./backgrounds/${backgroundFiles[Math.floor(Math.random() * backgroundFiles.length)]}`;
    console.log(`Using background: ${randomBackground}`);

    // Get IGN from bearer token first
    const bearerResponse = await getBearerIGN(bearer);
    if (bearerResponse === "Invalid Username") {
      return res.status(404).send("Invalid Bearer Token");
    }

    const imageBuffer = await generateBubbleImage(randomBackground, "", typeof bearerResponse === 'object' && bearerResponse.name ? bearerResponse.name : "", process.env.HYPIXEL_API_KEY || "", width, height, watermark, censor, bearer);

    if (imageBuffer.toString() === "Invalid Username") {
      return res.status(404).send("Invalid Username");
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Generated image buffer is empty");
    }

    console.log(`Image generated successfully, size: ${imageBuffer.length} bytes`);
    const compressedBuffer = gzipSync(imageBuffer);
    console.log(`Image compressed, size: ${compressedBuffer.length} bytes`);

    res.set({
      "Content-Type": "image/png",
      "Content-Encoding": "gzip",
      "Content-Length": compressedBuffer.length
    });
    res.send(compressedBuffer);
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      res.status(500).send(`Error generating image: ${error.message}`);
    } else {
      res.status(500).send("Error generating image");
    }
  }
});

app.get("/stats/:ign", async (req: any, res: any) => {
  const ign = req.params.ign;
  if (!ign) {
    return res.status(400).send("Missing ign parameter");
  }

  const watermark = req.query.watermark as string || "";
  const censor = req.query.censor?.toString().toLowerCase() === "true" || false;
  const resolution = "1920x1080";
  const [width, height] = resolution.split("x").map(Number);

  if (!width || !height || width < 100 || height < 100) {
    return res.status(400).send("Invalid resolution");
  }

  try {
    console.log(`Generating image for ${ign}...`);
    const backgroundFiles = fs.readdirSync('./backgrounds');
    if (!backgroundFiles.length) {
      throw new Error("No background files found");
    }
    const randomBackground = `./backgrounds/${backgroundFiles[Math.floor(Math.random() * backgroundFiles.length)]}`;
    console.log(`Using background: ${randomBackground}`);

    const imageBuffer = await generateBubbleImage(randomBackground, "", ign || "", process.env.HYPIXEL_API_KEY || "", width, height, watermark, censor, "");

    if (imageBuffer.toString() === "Invalid Username") {
      return res.status(404).send("Invalid Username");
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Generated image buffer is empty");
    }

    console.log(`Image generated successfully, size: ${imageBuffer.length} bytes`);
    const compressedBuffer = gzipSync(imageBuffer);
    console.log(`Image compressed, size: ${compressedBuffer.length} bytes`);

    res.set({
      "Content-Type": "image/png",
      "Content-Encoding": "gzip",
      "Content-Length": compressedBuffer.length
    });
    res.send(compressedBuffer);
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      res.status(500).send(`Error generating image: ${error.message}`);
    } else {
      res.status(500).send("Error generating image");
    }
  }
});

export function startServer() {
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
}
