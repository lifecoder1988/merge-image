export interface ImageDimensions {
  width: number;
  height: number;
}

export const getImageDimensions = (src: string): Promise<ImageDimensions> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = src;
  });
};

export const resizeImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  x: number = 0,
  y: number = 0
) => {
  // 计算缩放比例以保持宽高比
  const imgAspectRatio = img.width / img.height;
  const targetAspectRatio = targetWidth / targetHeight;

  let drawWidth = targetWidth;
  let drawHeight = targetHeight;
  let drawX = x;
  let drawY = y;

  if (imgAspectRatio > targetAspectRatio) {
    // 图片更宽，以高度为准
    drawWidth = targetHeight * imgAspectRatio;
    drawX = x - (drawWidth - targetWidth) / 2;
  } else {
    // 图片更高，以宽度为准
    drawHeight = targetWidth / imgAspectRatio;
    drawY = y - (drawHeight - targetHeight) / 2;
  }

  // 裁剪区域
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, targetWidth, targetHeight);
  ctx.clip();
  
  // 绘制图片
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
};

export const addImageBorder = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  borderWidth: number = 2,
  borderColor: string = '#ffffff'
) => {
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(x, y, width, height);
};

export const addImageShadow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(x, y, width, height);
  
  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const compressImage = (
  canvas: HTMLCanvasElement,
  quality: number = 0.8,
  format: string = 'image/jpeg'
): string => {
  return canvas.toDataURL(format, quality);
};