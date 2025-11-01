import { Buffer } from 'node:buffer';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

async function fetchCapes(apikey: string, uuid: string) {
    if (uuid === "8667ba71b85a4004af54457a9734eed7") {
        return "None";
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(`https://laby.net/api/v3/user/${uuid}/profile`, {
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) {
            return "None";
        }

        const data = await res.json();
        let capes = [];

        if (data?.textures?.CAPE) {
            for (let cape of data.textures.CAPE) {
                const capeHash = cape.image_hash;
                const capePath = path.join('capes', `${capeHash}.png`);

                try {
                    const cachedCape = await fs.readFile(capePath);
                    capes.push({
                        name: `Cape_${capeHash.substring(0, 8)}`,
                        image: cachedCape,
                        dimensions: {
                            width: 40,
                            height: 64
                        }
                    });
                } catch {
                    const capeController = new AbortController();
                    const capeTimeout = setTimeout(() => capeController.abort(), 15000);

                    const capeResponse = await fetch(`https://laby.net/texture/cape/${capeHash}.png`, {
                        signal: capeController.signal
                    });
                    clearTimeout(capeTimeout);

                    if (capeResponse.ok) {
                        const capeArrayBuffer = await capeResponse.arrayBuffer();
                        const capeBuffer = Buffer.from(capeArrayBuffer);

                        await fs.mkdir('capes', { recursive: true });

                        // Save cape to cache
                        await fs.writeFile(capePath, capeBuffer);

                        capes.push({
                            name: `Cape_${capeHash.substring(0, 8)}`,
                            image: capeBuffer,
                            dimensions: {
                                width: 40,
                                height: 64
                            }
                        });
                    }
                }
            }
        }
        return capes.length > 0 ? capes : "None";
    } catch (error) {
        console.error('Error fetching capes:', error);
        return "None";
    }
}

export { fetchCapes };