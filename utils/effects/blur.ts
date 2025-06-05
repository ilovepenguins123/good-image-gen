function blur(ctx: any, radius: number, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels: Uint8ClampedArray = imageData.data;
    
    const div: number = 2 * radius + 1;
    const widthMinus1: number = width - 1;
    const heightMinus1: number = height - 1;
    
    for (let y = 0; y < height; y++) {
      let sum_r = 0, sum_g = 0, sum_b = 0;
      
      // Initial sum for first pixel
      for (let i = -radius; i <= radius; i++) {
        const p: number = (y * width + Math.max(0, Math.min(widthMinus1, i))) * 4;
        sum_r += pixels[p];
        sum_g += pixels[p + 1];
        sum_b += pixels[p + 2];
      }
      
      // Blur horizontally
      for (let x = 0; x < width; x++) {
        const pixelIndex: number = (y * width + x) * 4;
        
        // Set blurred values
        pixels[pixelIndex] = sum_r / div;
        pixels[pixelIndex + 1] = sum_g / div;
        pixels[pixelIndex + 2] = sum_b / div;
        
        // Update sums for next pixel
        if (x < widthMinus1) {
          const nextIndex: number = (y * width + Math.min(widthMinus1, x + radius + 1)) * 4;
          const prevIndex: number = (y * width + Math.max(0, x - radius)) * 4;
          
          sum_r += pixels[nextIndex] - pixels[prevIndex];
          sum_g += pixels[nextIndex + 1] - pixels[prevIndex + 1];
          sum_b += pixels[nextIndex + 2] - pixels[prevIndex + 2];
        }
      }
    }
    

    for (let x = 0; x < width; x++) {
      let sum_r = 0, sum_g = 0, sum_b = 0;
      
      for (let i = -radius; i <= radius; i++) {
        const p: number = (Math.max(0, Math.min(heightMinus1, i)) * width + x) * 4;
        sum_r += pixels[p];
        sum_g += pixels[p + 1];
        sum_b += pixels[p + 2];
      }
      
      // Blur vertically
      for (let y = 0; y < height; y++) {
        const pixelIndex: number = (y * width + x) * 4;
        
        // Set blurred values
        pixels[pixelIndex] = sum_r / div;
        pixels[pixelIndex + 1] = sum_g / div;
        pixels[pixelIndex + 2] = sum_b / div;
        
        // Update sums for next pixel
        if (y < heightMinus1) {
          const nextIndex: number = (Math.min(heightMinus1, y + radius + 1) * width + x) * 4;
          const prevIndex: number = (Math.max(0, y - radius) * width + x) * 4;
          
          sum_r += pixels[nextIndex] - pixels[prevIndex];
          sum_g += pixels[nextIndex + 1] - pixels[prevIndex + 1];
          sum_b += pixels[nextIndex + 2] - pixels[prevIndex + 2];
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  export default blur;