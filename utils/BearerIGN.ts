import axios from 'axios';

async function getBearerIGN(bearer: string) {
    try {
        const res = await axios.get("https://api.minecraftservices.com/minecraft/profile", {
            headers: {
                "Authorization": `Bearer ${bearer}`
            }
        });
        return {
            name: res.data.name,
            uuid: res.data.id
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return "Invalid Username";
        }
        throw error;
    }
}

export default getBearerIGN;