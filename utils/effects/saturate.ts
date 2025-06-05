import { CanvasRenderingContext2D } from 'canvas';

function saturate(ctx: CanvasRenderingContext2D, saturation: number): void {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = gray + saturation * (r - gray);
        data[i + 1] = gray + saturation * (g - gray);
        data[i + 2] = gray + saturation * (b - gray);
    }
    ctx.putImageData(imageData, 0, 0);
}

export default saturate;