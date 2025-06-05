function createBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string | { text: string; effects?: string; color?: string }[] = '',
  title: string | { text: string; color?: string; effects?: string }[] = '',
  opacity: number = 0.4,
  textColor: string = 'white',
  titleColor: string = 'white'
): void {
  const radius = Math.min(width, height) * 0.15;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

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

  // Helper function to parse colored text
  const parseColoredText = (input: string, defaultColor: string): { text: string; color: string }[] => {
    const segments: { text: string; color: string }[] = [];
    let currentColor = defaultColor;
    let lastIndex = 0;
    const regex = /<color=([^>]+)>|<\/color>/g;
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(input)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: input.slice(lastIndex, match.index), color: currentColor });
      }
      currentColor = match[0].startsWith('<color=') ? match[1] : defaultColor;
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < input.length) {
      segments.push({ text: input.slice(lastIndex), color: currentColor });
    }
    return segments;
  };

  // Draw title
  if (title) {
    const titleLines = Array.isArray(title) ? title : [{ text: title, color: titleColor }];
    const startY = y - halfHeight + 40;
    ctx.font = `bold 36px "ProductSansBold"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    titleLines.forEach((line, i) => {
      const segments = parseColoredText(line.text, line.color || titleColor);
      const totalWidth = segments.reduce((sum, seg) => sum + ctx.measureText(seg.text).width, 0);
      let currentX = x - totalWidth / 2;

      segments.forEach(seg => {
        ctx.fillStyle = seg.color;
        const segWidth = ctx.measureText(seg.text).width;
        ctx.fillText(seg.text, currentX + segWidth / 2, startY + i * 40); // Increased spacing
        currentX += segWidth;
      });
    });
  }

  // Draw text
  if (text) {
    const textLines = Array.isArray(text) ? text : [{ text: text, color: textColor }];
    const startY = y - halfHeight + 80;
    ctx.textBaseline = 'middle';

    textLines.forEach((line, i) => {
      const segments = parseColoredText(line.text, line.color || textColor);
      let totalWidth = 0;
      
      segments.forEach(seg => {
        const font = line.effects?.includes('bold') ? 'ProductSansBold' : 'ProductSans';
        ctx.font = `${line.effects?.includes('bold') ? 'bold ' : ''}28px "${font}"`;
        totalWidth += ctx.measureText(seg.text).width;
      });

      // Scale if needed
      const scaleFactor = totalWidth > width - 40 ? (width - 40) / totalWidth : 1;
      const scaledWidth = totalWidth * scaleFactor;
      let currentX = x - scaledWidth / 2;

      segments.forEach(seg => {
        const font = line.effects?.includes('bold') ? 'ProductSansBold' : 'ProductSans';
        ctx.font = `${line.effects?.includes('bold') ? 'bold ' : ''}${Math.floor(28 * scaleFactor)}px "${font}"`;
        ctx.fillStyle = seg.color;
        const segWidth = ctx.measureText(seg.text).width;
        ctx.fillText(seg.text, currentX + segWidth / 2, startY + i * 35); // Increased line spacing
        currentX += segWidth;
      });
    });
  }
}

export default createBubble;