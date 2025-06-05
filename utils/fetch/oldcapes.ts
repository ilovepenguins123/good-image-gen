import axios from 'axios';
import { extractCape } from '../extractcape';
async function fetchCapes(apikey: string, uuid: string) {
    const res = await axios.get(`https://api.crafty.gg/api/v2/players/${uuid}?`);
    if (uuid === "8667ba71b85a4004af54457a9734eed7") {
        return "None";
      }
      let unfiltered = res.data.data.capes.filter((cape: any) => cape.type.name === 'Mojang')
      let capes = [];
      for (let cape of unfiltered) {
        capes.push(await extractCape(cape.texture, cape.name));
      } 
      return capes;
}
export { fetchCapes };