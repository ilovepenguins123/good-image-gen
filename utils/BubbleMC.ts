function bubbleMC(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, text: string = '', title: string, opacity: number = 0.4, fontSize: number = 28): void {
  // Pre-calculate commonly used values
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const radius = Math.min(width, height) * 0.25;

  // Draw bubble background in one path
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.beginPath();
  ctx.moveTo(x - halfWidth + radius, y - halfHeight);
  ctx.lineTo(x + halfWidth - radius, y - halfHeight);
  ctx.quadraticCurveTo(x + halfWidth, y - halfHeight, x + halfWidth, y - halfHeight + radius);
  ctx.lineTo(x + halfWidth, y + halfHeight - radius);
  ctx.quadraticCurveTo(x + halfWidth, y + halfHeight, x + halfWidth - radius, y + halfHeight);
  ctx.lineTo(x - halfWidth + radius, y + halfHeight);
  ctx.quadraticCurveTo(x - halfWidth, y + halfHeight, x - halfWidth, y + halfHeight - radius);
  ctx.lineTo(x - halfWidth, y - halfHeight + radius);
  ctx.quadraticCurveTo(x - halfWidth, y - halfHeight, x - halfWidth + radius, y - halfHeight);
  ctx.closePath();
  ctx.fill();

  // Set common text properties once
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (title) {
    const titleLines = Array.isArray(title) ? title : [{text: title}];
    const lineHeight = 32;
    const totalHeight = lineHeight * titleLines.length;
    const startY = y - height/6 - totalHeight/2;
    ctx.font = `32px "Minecraft"`;

    for (let i = 0; i < titleLines.length; i++) {
      const line = titleLines[i];
      const colorTags = line.text.match(/<color=(?:#)?([^>]+)>.*?<\/color>/g);
      
      if (colorTags) {
        const plainText = line.text.replace(/<\/?color(?:=(?:#)?[^>]+)>/g, '');
        const titleWidth = ctx.measureText(plainText).width;
        let currentX = x - titleWidth/2;

        const segments = line.text.split(/(<color=(?:#)?[^>]+>.*?<\/color>)/);
        for (const segment of segments) {
          if (!segment) continue;
          
          const colorMatch = segment.match(/<color=(?:#)?([^>]+)>(.*?)<\/color>/);
          if (colorMatch) {
            const [, color, content] = colorMatch;
            console.log('Title color:', color, 'content:', content);
            ctx.fillStyle = color.toLowerCase();
            const width = ctx.measureText(content).width;
            ctx.fillText(content, currentX, startY + lineHeight * i);
            currentX += width;
          } else {
            ctx.fillStyle = 'white';
            const width = ctx.measureText(segment).width;
            ctx.fillText(segment, currentX, startY + lineHeight * i);
            currentX += width;
          }
        }
      } else {
        ctx.fillStyle = 'white';
        ctx.fillText(line.text, x, startY + lineHeight * i);
      }
    }
  }

  if (text) {
    ctx.font = `${fontSize}px "Minecraft"`;
    const startY = title ? y + height/6 : y;

    const segments = text.split(/(<color=[^>]+>|<\/color>)/);
    const parts = [];
    let currentColor = 'white';
    let totalWidth = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment) continue;

      if (segment.startsWith('<color=')) {
        currentColor = segment.slice(7, -1);
        console.log('Text color:', currentColor);
      } else if (segment === '</color>') {
        currentColor = 'white';
      } else {
        const width = ctx.measureText(segment).width;
        parts.push({
          text: segment,
          color: currentColor.toLowerCase(),
          width
        });
        totalWidth += width;
      }
    }

    let currentX = x - totalWidth/2;
    for (const part of parts) {
      console.log('Drawing part:', part.text, 'with color:', part.color);
      ctx.fillStyle = part.color;
      ctx.fillText(part.text, currentX + part.width/2, startY);
      currentX += part.width;
    }
  }
}

export default bubbleMC;