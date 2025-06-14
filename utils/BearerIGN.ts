import axios from 'axios';
import { extractCape } from './extractcape';

async function getBearerIGN(bearer: string) {
    try {
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
                
                const base64Cape = Buffer.from(capeImage.data).toString('base64');
                capes.push(await extractCape(base64Cape, cape.alias || `Cape_${cape.id.substring(0, 8)}`));
            }
        }
        
        return {
            name: res.data.name,
            uuid: res.data.id,
            capes: capes.length > 0 ? capes : "None"
        }
    } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 404)) {
            return "Invalid Username";
        }
        throw error;
    }
}

export default getBearerIGN;