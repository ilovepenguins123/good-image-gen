import { createCanvas, loadImage } from 'canvas';
import fs from 'node:fs';
import path from 'path';
async function extractCape(base64Texture: string, capeName: string) {
    try {
        const inputBuffer = Buffer.from(base64Texture, 'base64');
        const image = await loadImage(inputBuffer);
        
        // First extract at original size
        const extractCanvas = createCanvas(12, 16);
        const extractCtx = extractCanvas.getContext('2d');
        extractCtx.drawImage(image, 1, 0, 12, 16, 0, 0, 12, 16);
        
        const upscaleCanvas = createCanvas(32, 64);
        const upscaleCtx = upscaleCanvas.getContext('2d');
        upscaleCtx.imageSmoothingEnabled = false; // Use nearest neighbor for pixel art
        upscaleCtx.drawImage(extractCanvas, 0, 0, 10, 16, 0, 0, 32, 64);
        
        const buffer = upscaleCanvas.toBuffer('image/png');
        saveCape(buffer, capeName);
        return {
            image: buffer,
            name: capeName,
            dimensions: {
                width: 40,
                height: 64
            }
        };
        
    } catch (error: any) {
        throw new Error('Canvas processing failed: ' + error.message);
    }
}

function saveCape(cape: Buffer, name: string) {
    const capesDir = path.join(process.cwd(), 'capes');
    if (!fs.existsSync(capesDir)) {
        fs.mkdirSync(capesDir, { recursive: true });
    }
    fs.writeFileSync(path.join(capesDir, `${name}.png`), cape);
}

export { extractCape };