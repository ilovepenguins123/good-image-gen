import axios from 'axios';
import { Buffer } from 'node:buffer';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

async function fetchCapes(apikey: string, uuid: string) {
    if (uuid === "8667ba71b85a4004af54457a9734eed7") {
        return "None";
    }

    const res = await axios.get(`https://laby.net/api/v3/user/${uuid}/profile`);
    let capes = [];

    if (res.data?.textures?.CAPE) {
        for (let cape of res.data.textures.CAPE) {
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
                const capeImage = await axios.get(`https://laby.net/texture/cape/${capeHash}.png`, {
                    responseType: 'arraybuffer'
                });
                
                await fs.mkdir('capes', { recursive: true });
                
                // Save cape to cache
                await fs.writeFile(capePath, Buffer.from(capeImage.data));
                
                capes.push({
                    name: `Cape_${capeHash.substring(0, 8)}`,
                    image: Buffer.from(capeImage.data),
                    dimensions: {
                        width: 40,
                        height: 64
                    }
                });
            }
        }
    }
    return capes.length > 0 ? capes : "None";
}

export { fetchCapes };