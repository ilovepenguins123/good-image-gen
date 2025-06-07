import axios from 'axios';
import { extractCape } from '../extractcape';

async function getcapesmc(bearer: string) {
    const res = await axios.get("https://api.minecraftservices.com/minecraft/profile", {
        headers: {
            "Authorization": `Bearer ${bearer}`
        }
    });
    let capes = [];

    if (res.data?.capes) {
        for (let cape of res.data.capes) {
            const capeUrl = cape.url;
            const capeImage = await axios.get(capeUrl, {
                responseType: 'arraybuffer'
            });
            
            capes.push(await extractCape(Buffer.from(capeImage.data), cape.alias || `Cape_${cape.id.substring(0, 8)}`));
        }
    }
    return capes.length > 0 ? capes : "None";
}

export default getcapesmc;