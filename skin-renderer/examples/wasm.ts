import init, {  SkinRenderer, SkinMessenger } from "../pkg/statsify_skin_renderer.js"

async function main() {
    await init();

const renderer = new SkinRenderer();
renderer.run();

const response = await fetch("http://textures.minecraft.net/texture/f9d17f91b817be0d21bd1bea95243423a5fcd553305ba9d6f07d3a769953c6e6");
const skin = await response.arrayBuffer();

SkinMessenger.registerCanvas("skin");
SkinMessenger.renderSkin("skin", new Uint8Array(skin), true, true);
}
main();