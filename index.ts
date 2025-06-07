import { createCanvas, loadImage, Image, registerFont } from 'canvas';
import type { CanvasRenderingContext2D } from 'canvas';
import * as fs from 'node:fs';
import { Buffer } from 'node:buffer';
import { gzipSync } from 'node:zlib';
import blur from './utils/effects/blur.ts';
import createBubble from './utils/createBubble.ts';
import MCQuery from './utils/fetch/MCQuery.ts';
import bubbleMC from './utils/BubbleMC.ts';
import { formatNetWorth, getFKDRColor, formatPlayerName, formatNumber } from './utils/Format.ts';
import saturate from './utils/effects/saturate.ts';
import fetchAllStats from './utils/fetch/all.ts';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import getBearerIGN from './utils/BearerIGN.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fonts = [
  ['Minecraft.ttf', 'Minecraft'],
  ['MinecraftBold.ttf', 'MinecraftBold'],
  ['Poppins-Bold.ttf', 'Poppins'],
  ['Poppins-Regular.ttf', 'Poppins'],
  ['Product Sans Regular.ttf', 'ProductSans'],
  ['Product Sans Bold.ttf', 'ProductSansBold']
];

fonts.forEach(([filename, family]) => {
  try {
    const fontPath = resolve(__dirname, 'fonts', filename);
    if (!fs.existsSync(fontPath)) {
      throw new Error(`Font file not found: ${fontPath}`);
    }
    registerFont(fontPath, { family });
    devlog('Font registered', { path: fontPath, family });
  } catch (error) {
    console.error(`Failed to register font ${filename}:`, error);
    throw error;
  }
});

function devlog(stage: string, data?: any) {
  if (process.env.PROD !== 'TRUE') {
    if (data) {
      console.log(`[DEV] ${stage}:`, data);
    } else {
      console.log(`[DEV] ${stage}`);
    }
  }
}

async function getSkinAndRender(uuid: string): Promise<Buffer> {
  try {
    const response = await fetch(`https://nmsr.nickac.dev/fullbody/${uuid}`);
    const buffer = await response.arrayBuffer();
    console.log(uuid)
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error getting/rendering skin:', error);
    throw new Error('Failed to get or render skin: ' + (error instanceof Error ? error.message : String(error)));
  }
}


async function generateBubbleImage(backgroundPath: string, outputPath: string, ign: string, apikey: string, width: number = 1920, height: number = 1080, watermark: string, censor: boolean, bearer: string): Promise<Buffer> {
  devlog('Starting image generation', { ign, width, height });
  let username = ign;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const tempCanvas = createCanvas(width, height);
  const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

  devlog('Loading background');
  const backgroundImage = await loadImage(backgroundPath);
  tempCtx.drawImage(backgroundImage, 0, 0, width, height);
  
  devlog('Applying blur effect');
  blur(tempCtx, 30, width, height);
  ctx.drawImage(tempCanvas, 0, 0);

  devlog('Fetching player data');
  let uuidResponse;
  if (!bearer) {
    console.log(bearer)
    uuidResponse = await MCQuery(ign);
    if (uuidResponse === "Invalid Username") {
      return Buffer.from("Invalid Username");
    }
  } else {
    uuidResponse = await getBearerIGN(bearer);
    if (uuidResponse === "Invalid Username") {
      return Buffer.from("Invalid Username");
    }
    if (typeof uuidResponse === 'object' && uuidResponse.ign) {
      username = uuidResponse.ign;
    }
  }
  devlog('MCQuery response', uuidResponse);
  
  const { generalstats, sbstats, guildStats, capes } = await fetchAllStats(apikey, ign, bearer);
  devlog('Stats fetched', { 
    hasGeneralStats: !!generalstats, 
    hasSkyblockStats: !!sbstats, 
    hasGuildStats: !!guildStats, 
    capesCount: capes === "None" ? 0 : capes.length 
  });

  const centerX = width / 2;
  const centerY = height / 2;
  const bubbleWidth = width * 0.156;
  const bubbleHeight = height * 0.139;
  const playerInfoX = centerX - (width * 0.29) - (width * 0.065);
  const statsX = centerX - (width * 0.12) + 25;
  const rightStatsX = centerX + (width * 0.075 * 1.5) + 25;
  const rightStatsX2 = centerX + (width * 0.26 * 1.25) + 25;

  const playerName = username === 'Steve' ? ign : username;
  const pluses = typeof (generalstats as any)?.rank?.rank === 'string' ? ((generalstats as any).rank.rank.match(/\+/g)?.length || 0) : 0;
  const playerNameDisplay = formatPlayerName(
    (generalstats as any)?.rank || { rank: "NONE", color: "gray", plusColor: "yellow" },
    playerName ? (censor ? `${playerName[0]}${'*'.repeat(Math.max(0, playerName.length - 2))}${playerName[playerName.length - 1]}` : playerName) : 'Unknown',
    pluses
  );
  devlog('Player name formatted', { playerName, playerNameDisplay });

  devlog('Creating main bubble');
  createBubble(ctx as any, centerX, centerY, width * 0.833 * 1.15, height * 0.741 * 1.2, '', '', 0.3)

  devlog('Creating player info bubble');
  createBubble(ctx as any, playerInfoX, centerY + (height * 0.075), bubbleWidth * 1.2, height * 0.6, '', '', 0.4);
  bubbleMC(ctx as any, playerInfoX * 4.2 , centerY - (height * 0.36), bubbleWidth * 4.025, height * 0.055, playerNameDisplay, '', 0.5, 32);

  devlog('Creating stats bubbles');
  createBubble(ctx as any, statsX, centerY - (height * 0.15), bubbleWidth * 1.2, height * 0.231, [
    { text: `<color=#89cff0>Skyblock Level:</color> ${(sbstats as any)?.skyblockLevel || "0"}`, effects: 'bold' },
    { text: `<color=#FFD700>Net Worth:</color> ${(sbstats as any)?.networth ? formatNetWorth((sbstats as any).networth) : "0"}`, effects: 'bold' },
    { text: `<color=#90EE90>Skill Average:</color> ${(sbstats as any)?.skillAverageWithProgress?.toFixed(2) || "0"}`, effects: 'bold' },
    { text: `<color=#E97451>Catacombs:</color> ${(sbstats as any)?.catacombsLevel || "0"}`, effects: 'bold' }
  ], 'Skyblock', 0.4);

  createBubble(ctx as any, statsX, centerY + (height * 0.125), bubbleWidth * 1.2, height * 0.231, [
    { text: `<color=#89cff0>Stars:</color> ${(generalstats as any)?.bedwars?.level ?? "0"}`, effects: 'bold' },
    { text: `<color=${getFKDRColor((generalstats as any)?.bedwars?.fkdr)}>FKDR:</color> ${isNaN((generalstats as any)?.bedwars?.fkdr) ? "0" : (generalstats as any)?.bedwars?.fkdr?.toFixed(2)}`, effects: 'bold' },
    { text: `<color=#FFD700>Winstreak:</color> ${(generalstats as any)?.bedwars?.winstreak ?? "0"}`, effects: 'bold' },
  ], 'Bedwars', 0.4);

  createBubble(ctx as any, rightStatsX, centerY - (height * 0.15), bubbleWidth, height * 0.231, [
    { text: `LVL: ${(generalstats as any)?.leveling?.level ?? 0}`, effects: 'bold' },
    { text: `${((generalstats as any)?.leveling?.experience ?? 0).toLocaleString()} / <color=#89cff0>${((generalstats as any)?.leveling?.experienceneeded ?? 2500).toLocaleString()}</color>`, effects: 'bold' },
  ], 'Network Level', 0.4);
  if ((generalstats as any)?.ranksgifted > 0 ) {
    bubbleMC(ctx as any, playerInfoX, centerY - (height * 0.25), bubbleWidth, height * 0.231, `<color=#FFD700>Ranks gifted: ${(generalstats as any)?.ranksgifted ?? "0"}</color>`, '', 0);
  }

  drawLevelProgressBar(ctx as any, generalstats, width, height);

  createBubble(ctx as any, rightStatsX2, centerY - (height * 0.15), bubbleWidth, height * 0.231, [
    { text: `<color=#89cff0>Stars:</color> ${(generalstats as any)?.skywars?.level ?? "0"}`, effects: 'bold' },
    { text: `<color=#90EE90>Kills:</color> ${formatNumber((generalstats as any)?.skywars?.kills ?? 0)}`, effects: 'bold' },
    { text: `<color=#FFD700>Deaths:</color> ${formatNumber((generalstats as any)?.skywars?.deaths ?? 0)}`, effects: 'bold' },
  ], 'Skywars', 0.4);

  // Handle guild stats
  const hasGuild = (guildStats as any)?.guild?.name && (guildStats as any).guild.name !== 'NONE';
  if (hasGuild) {
    createBubble(ctx as any, rightStatsX, centerY + (height * 0.125), bubbleWidth, height * 0.231, [
      { text: `<color=#FFD700>Name:</color> ${(guildStats as any)?.guild?.name ? (censor ? (guildStats as any).guild.name[0] + '*'.repeat(Math.max(0, (guildStats as any).guild.name.length - 2)) + (guildStats as any).guild.name[(guildStats as any).guild.name.length - 1] : (guildStats as any).guild.name) : ''}`, effects: 'bold' },
      ...((guildStats as any)?.guild?.rank ? [{ text: `<color=#90EE90>Rank:</color> ${(guildStats as any)?.guild?.rank ?? "NONE"}`, effects: 'bold' }] : []),
      ...((guildStats as any)?.guild?.tag ? [{ text: `<color=#90EE90>Tag:</color> ${(guildStats as any).guild.tag}`, effects: 'bold' }] : []),
      ...[{ text: `<color=#89cff0>Level:</color> ${(guildStats as any)?.guild?.level ?? 0}`, effects: 'bold' }],
    ], 'Guild', 0.4);

    // Move duels box to rightStatsX2 when there's a guild
    createBubble(ctx as any, rightStatsX2, centerY + (height * 0.125), bubbleWidth, height * 0.231, [
      { text: `<color=#89cff0>Wins:</color> ${(generalstats as any)?.duels?.wins ?? "0"}`, effects: 'bold' },
      { text: `<color=#90EE90>Kills:</color> ${formatNumber((generalstats as any)?.duels?.kills ?? 0)}`, effects: 'bold' },
      { text: `<color=#FFD700>Losses:</color> ${formatNumber((generalstats as any)?.duels?.losses ?? 0)}`, effects: 'bold' },
    ], 'Duels', 0.4);
  } else {
    createBubble(ctx as any, rightStatsX, centerY + (height * 0.125), bubbleWidth, height * 0.231, [
      { text: `<color=#89cff0>Wins:</color> ${(generalstats as any)?.duels?.wins ?? "0"}`, effects: 'bold' },
      { text: `<color=#90EE90>Kills:</color> ${formatNumber((generalstats as any)?.duels?.kills ?? 0)}`, effects: 'bold' },
      { text: `<color=#FFD700>Losses:</color> ${formatNumber((generalstats as any)?.duels?.losses ?? 0)}`, effects: 'bold' },
    ], 'Duels', 0.4);
  }

  if (capes !== "None") {
    devlog('Processing capes', { count: capes.length });
    const loadedCapes = await Promise.all(capes.map(async (cape: any) => {
      const capeImage = await loadImage(Buffer.from(cape.image));
      return { ...cape, image: capeImage };
    }));
    devlog('Capes loaded');

    const capeCount = capes.length;
    const baseScale = width / 1920 * 1.5;
    const scaleMultiplier = Math.max(0.5, Math.min(1.2, 10 / Math.min(capeCount, 14)));
    const scale = baseScale * scaleMultiplier;
    const spacingMultiplier = Math.max(0.5, Math.min(1.2, 10 / Math.min(capeCount, 14)));
    const spacing = 50 * spacingMultiplier;

    const capesPerRow = capeCount > 10 ? Math.ceil(capeCount / 2) : capeCount;
    let currentRow = 0;
    let px: number | undefined = undefined;

    loadedCapes.forEach((cape: any, index: number) => {
      const scaledWidth = cape.dimensions.width * scale * 1.2;
      const scaledHeight = cape.dimensions.height * scale * 1.2;
      
      if (index % capesPerRow === 0) {
        currentRow = Math.floor(index / capesPerRow);
        const rowCapes = Math.min(capesPerRow, capeCount - (currentRow * capesPerRow));
        const totalWidth = scaledWidth * rowCapes + spacing * (rowCapes - 1);
        
        if (capeCount <= 10) {
          px = (width * 0.325) 
        } else {
          const offset = capeCount * 0.0085;
          px = (width * 0.325) - (totalWidth / 2) + (offset * width) + (width * 0.04);
        }
      }

      const baseY = height * 0.775;
      const yOffset = capeCount > 10 ? capeCount * 1 : 0;
      const currentSmoothing = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(cape.image, px!, baseY + (currentRow * (scaledHeight + 20)) - yOffset, scaledWidth, scaledHeight);
      ctx.imageSmoothingEnabled = currentSmoothing;
      px! += scaledWidth + spacing;
    });
  }
  bubbleMC(ctx as any, width * 0.15, centerY - (height * 0.36), bubbleWidth * 1.2, height * 0.11, `<color=#FFD700>First Login:</color> ${generalstats.firstLogin || "None"}`, '', 0.0, 24);
  bubbleMC(ctx as any, width * 0.15, centerY - (height * 0.3), bubbleWidth * 1.2, height * 0.11, `<color=#FFD700>Last Login:</color> ${generalstats.lastLogin || "None"}`, '', 0.0, 24);
  if (watermark) {
    devlog('Adding watermark');
    bubbleMC(ctx as any, playerInfoX + (width * 0.42), centerY - (height * 0.015), bubbleWidth * 1.2, height * 0.11, `<color=#00FFFF>${watermark}</color>`, '', 0.0);
  }

  if (uuidResponse?.id) {
    devlog('Rendering player skin');
    const skinImage = await loadImage(await getSkinAndRender(uuidResponse.id));
    drawPlayerSkin(ctx as any, skinImage, width, height);
  } else if (bearer && typeof uuidResponse === 'object' && 'uuid' in uuidResponse) {
    devlog('Rendering player skin from bearer');
    const skinImage = await loadImage(await getSkinAndRender(uuidResponse.uuid));
    drawPlayerSkin(ctx as any, skinImage, width, height);
  }
  saturate(ctx, 1.5);
  devlog('Converting to buffer');
  const buffer = canvas.toBuffer('image/png');
  devlog('Image generation complete', { bufferSize: buffer.length });
  
  return buffer;
}

function drawLevelProgressBar(ctx: CanvasRenderingContext2D, stats: any, width: number, height: number) {
  const barWidth = width * 0.13;
  const barHeight = height * 0.019;
  const barX = (width * 0.625) - barWidth/2;
  const barY = height * 0.4;
  const progress = stats?.leveling?.experience && stats?.leveling?.experienceneeded ? 
    stats.leveling.experience / stats.leveling.experienceneeded : 0;

  ctx.beginPath();
  ctx.fillStyle = 'rgba(137, 207, 240, 0.2)';
  ctx.roundRect(barX, barY, barWidth, barHeight, barHeight/2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(137, 207, 240, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (stats?.leveling?.experience > 0) {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(137, 207, 240, 0.8)';
    ctx.roundRect(barX, barY, barWidth * progress, barHeight, barHeight/2);
    ctx.fill();
  }
}

function drawPlayerSkin(ctx: CanvasRenderingContext2D, image: Image, width: number, height: number) {
  try {
    const scale = width / 1920 * 0.55;
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    ctx.drawImage(image, (width * 0.13) - scaledWidth/2, (height * 0.55) - scaledHeight/2, scaledWidth * 1.2, scaledHeight * 1.2);
  } catch (error) {
    console.error('Error drawing player skin:', error);
    // Draw a placeholder or skip skin rendering
  }
}

const app = express();
const router = express.Router();
const port = 3000;
router.get("/bearer/:bearer", async (req: any, res: any) => {
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
    
    const imageBuffer = await generateBubbleImage(randomBackground, "", typeof bearerResponse === 'object' && bearerResponse.ign ? bearerResponse.ign : "", process.env.HYPIXEL_API_KEY || "", width, height, watermark, censor, bearer);
    
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

router.get("/stats/:ign", async (req: any, res: any) => {
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

app.use(router);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
