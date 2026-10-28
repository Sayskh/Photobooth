export interface StickerItem {
  id: string;
  emoji: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  scale: number;
  rotation: number; // degrees
}

export interface RenderOptions {
  layoutType: string; // STRIP_2X6, GRID_4X6, POLAROID
  photos: string[]; // Base64 data URLs
  filter: string; // NORMAL, BW, VINTAGE, WARM, COLD
  frameColor: string; // HEX e.g. #FFFFFF
  stickers: StickerItem[];
  watermarkText?: string;
  themeStyle?: string; // CLASSIC, THEATER_TICKET, Y2K_CHECKER, GREEN_CAFE, POP_YELLOW
}

function loadImageSafely(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!src || typeof src !== "string" || src.trim().length === 0) {
      resolve(createFallbackImage());
      return;
    }

    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Photo load warning, using fallback placeholder");
      resolve(createFallbackImage());
    };
    img.src = src;
  });
}

function createFallbackImage(): HTMLImageElement {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 450;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#F4F4F5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#A1A1AA";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Pose Kosong", canvas.width / 2, canvas.height / 2);
  }
  const img = new Image();
  img.src = canvas.toDataURL("image/png");
  return img;
}

// 300 DPI Standard 4R Landscape Dimensions:
// 6 inch x 4 inch = 1800 x 1200 px (True Landscape Photobooth)
export async function renderCompositeCanvas(
  options: RenderOptions
): Promise<string> {
  const {
    layoutType,
    photos = [],
    filter,
    frameColor,
    stickers = [],
    watermarkText = "KioskSnap • Photobooth",
    themeStyle = "CLASSIC",
  } = options;

  const canvasWidth = 1800;
  const canvasHeight = 1200;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Gagal menginisialisasi canvas.");

  // Target count & loading photos
  const targetCount = layoutType === "STRIP_2X6" ? 6 : layoutType === "POLAROID" ? 4 : 4;
  const imageSources = Array.from({ length: targetCount }).map((_, idx) => photos[idx] || "");
  const loadedImages: HTMLImageElement[] = await Promise.all(
    imageSources.map((src) => loadImageSafely(src))
  );

  // ----------------------------------------------------
  // LAYOUT 1: STRIP_2X6 (2 HORIZONTAL LANDSCAPE STRIPS ON 4R PAPER)
  // ----------------------------------------------------
  if (layoutType === "STRIP_2X6") {
    const stripWidth = 1800;
    const stripHeight = 600;

    // Photos for Strip 1: indices 0, 1, 2
    const strip1Photos = [loadedImages[0], loadedImages[1], loadedImages[2]];
    // Photos for Strip 2: indices 3, 4, 5
    const strip2Photos = [
      loadedImages[3] || loadedImages[0],
      loadedImages[4] || loadedImages[1],
      loadedImages[5] || loadedImages[2],
    ];

    // Render Strip 1 (Top, y: 0)
    renderHorizontalStrip(
      ctx,
      0,
      0,
      stripWidth,
      stripHeight,
      strip1Photos,
      themeStyle,
      frameColor,
      filter,
      watermarkText,
      "STRIP 1 • POSE 1-3"
    );

    // Render Strip 2 (Bottom, y: 600)
    renderHorizontalStrip(
      ctx,
      0,
      stripHeight,
      stripWidth,
      stripHeight,
      strip2Photos,
      themeStyle,
      frameColor,
      filter,
      watermarkText,
      "STRIP 2 • POSE 4-6"
    );

    // Middle Horizontal Cut Guideline (Dashed line at y = 600)
    ctx.save();
    ctx.strokeStyle = "rgba(161, 161, 170, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(0, stripHeight);
    ctx.lineTo(stripWidth, stripHeight);
    ctx.stroke();

    // Little scissors mark helper
    ctx.fillStyle = "rgba(113, 113, 122, 0.6)";
    ctx.font = "11px monospace";
    ctx.fillText("✄  POTONG DI SINI", 80, stripHeight - 6);
    ctx.restore();
  }

  // ----------------------------------------------------
  // LAYOUT 2: GRID_4X6 (POSTCARD 4R LANDSCAPE: 4 PHOTOS 2x2)
  // ----------------------------------------------------
  else if (layoutType === "GRID_4X6") {
    // 1. Draw Background
    drawThemeBackground(ctx, 0, 0, canvasWidth, canvasHeight, themeStyle, frameColor);

    // 2. Draw 4 Photos in 2x2 Grid (Wide slots)
    const marginX = 80;
    const marginY = 50;
    const gapX = 40;
    const gapY = 30;
    const slotWidth = 780;
    const slotHeight = 480;

    const positions = [
      { x: marginX, y: marginY },
      { x: marginX + slotWidth + gapX, y: marginY },
      { x: marginX, y: marginY + slotHeight + gapY },
      { x: marginX + slotWidth + gapX, y: marginY + slotHeight + gapY },
    ];

    for (let i = 0; i < Math.min(4, loadedImages.length); i++) {
      const pos = positions[i];
      drawCroppedImage(ctx, loadedImages[i], pos.x, pos.y, slotWidth, slotHeight, filter);
    }

    // 3. Postcard Bottom Margin Watermark
    ctx.save();
    ctx.fillStyle = isLightColor(frameColor) ? "#27272A" : "#F4F4F5";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(watermarkText, marginX, canvasHeight - 25);

    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    ctx.font = "14px monospace";
    ctx.globalAlpha = 0.6;
    ctx.textAlign = "right";
    ctx.fillText(`MEMORIES • ${dateStr}`, canvasWidth - marginX, canvasHeight - 25);
    ctx.restore();
  }

  // ----------------------------------------------------
  // LAYOUT 3: POLAROID (2 POLAROID CARDS SIDE-BY-SIDE ON 4R LANDSCAPE)
  // ----------------------------------------------------
  else if (layoutType === "POLAROID") {
    const cardWidth = 900;
    const cardHeight = 1200;

    const card1Photos = [loadedImages[0], loadedImages[1]];
    const card2Photos = [
      loadedImages[2] || loadedImages[0],
      loadedImages[3] || loadedImages[1],
    ];

    renderSinglePolaroidCard(
      ctx,
      0,
      cardWidth,
      cardHeight,
      card1Photos,
      themeStyle,
      frameColor,
      filter,
      watermarkText,
      "CARD 1"
    );

    renderSinglePolaroidCard(
      ctx,
      cardWidth,
      cardWidth,
      cardHeight,
      card2Photos,
      themeStyle,
      frameColor,
      filter,
      watermarkText,
      "CARD 2"
    );

    // Vertical Cut Line at x = 900
    ctx.save();
    ctx.strokeStyle = "rgba(161, 161, 170, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(cardWidth, 0);
    ctx.lineTo(cardWidth, cardHeight);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Custom User Stickers on Top
  if (stickers && stickers.length > 0) {
    for (const st of stickers) {
      const posX = (st.x / 100) * canvasWidth;
      const posY = (st.y / 100) * canvasHeight;
      const fontSize = Math.round(72 * (st.scale || 1));

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate(((st.rotation || 0) * Math.PI) / 180);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(st.emoji, 0, 0);
      ctx.restore();
    }
  }

  return canvas.toDataURL("image/png", 0.95);
}

// ----------------------------------------------------
// HORIZONTAL STRIP RENDERER (6" x 2" = 1800 x 600 px)
// ----------------------------------------------------

function renderHorizontalStrip(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  width: number,
  height: number,
  photos: HTMLImageElement[],
  themeStyle: string,
  frameColor: string,
  filter: string,
  watermarkText: string,
  stripLabel: string
) {
  ctx.save();

  // 1. Draw Background
  drawThemeBackground(ctx, originX, originY, width, height, themeStyle, frameColor);

  // 2. 3 Landscape Photos side-by-side
  const marginY = 45;
  const slotHeight = height - marginY * 2; // 510 px
  const slotWidth = 445; // Aspect ratio ~4:3.5
  const marginX = 45;
  const gapX = 25;

  for (let i = 0; i < Math.min(3, photos.length); i++) {
    const x = originX + marginX + i * (slotWidth + gapX);
    drawCroppedImage(ctx, photos[i], x, originY + marginY, slotWidth, slotHeight, filter);
  }

  // 3. Editorial Studio Branding End-Block (Right Column)
  const brandingX = originX + marginX + 3 * (slotWidth + gapX);
  const brandingWidth = width - brandingX - marginX; // ~320 px
  renderStripBrandingColumn(
    ctx,
    brandingX,
    originY + marginY,
    brandingWidth,
    slotHeight,
    themeStyle,
    frameColor,
    watermarkText,
    stripLabel
  );

  ctx.restore();
}

// ----------------------------------------------------
// EDITORIAL STRIP BRANDING BLOCK (Right of each horizontal strip)
// ----------------------------------------------------

function renderStripBrandingColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  themeStyle: string,
  frameColor: string,
  watermarkText: string,
  stripLabel: string
) {
  ctx.save();

  const centerX = x + w / 2;
  const isLight = isLightColor(themeStyle === "CLASSIC" ? frameColor : getThemeBaseColor(themeStyle));
  const textColor = isLight ? "#18181B" : "#F4F4F5";

  if (themeStyle === "THEATER_TICKET") {
    const maroon = "#881337";
    ctx.strokeStyle = maroon;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, y + 5, w - 20, h - 10);

    ctx.fillStyle = maroon;
    ctx.textAlign = "center";
    ctx.font = "900 22px serif";
    ctx.fillText("ADMIT ONE", centerX, y + 60);

    ctx.font = "italic 13px serif";
    ctx.fillText("CINEMA PASS", centerX, y + 85);

    ctx.font = "bold 13px monospace";
    ctx.fillText(stripLabel, centerX, y + 140);

    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
    ctx.font = "12px monospace";
    ctx.fillText(dateStr, centerX, y + 170);
    ctx.fillText("SEAT A-04", centerX, y + 195);

    // Barcode
    drawVerticalBarcode(ctx, centerX - 55, y + 240, 110, 200, maroon);
  } else if (themeStyle === "Y2K_CHECKER") {
    const blue = "#1E3A8A";
    ctx.fillStyle = blue;
    ctx.textAlign = "center";

    ctx.font = "900 26px monospace";
    ctx.fillText("RADICAL", centerX, y + 70);

    ctx.font = "bold 14px monospace";
    ctx.fillText("MOMENT", centerX, y + 100);

    // Small checker accent box
    ctx.fillStyle = "#FBBF24";
    ctx.fillRect(x + 20, y + 140, w - 40, 60);
    ctx.fillStyle = blue;
    ctx.font = "bold 14px monospace";
    ctx.fillText(stripLabel, centerX, y + 175);

    ctx.font = "12px monospace";
    ctx.fillText("KIOSKSNAP • 2026", centerX, y + 260);
    ctx.fillText("STUDIO SHOT", centerX, y + 290);

    drawBarcode(ctx, x + 25, y + 360, w - 50, 70, blue);
  } else if (themeStyle === "GREEN_CAFE") {
    // Cafe Guest Check Badge
    ctx.fillStyle = "#FCE7F3";
    ctx.fillRect(x + 15, y + 20, w - 30, 70);
    ctx.strokeStyle = "#DB2777";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 15, y + 20, w - 30, 70);

    ctx.fillStyle = "#9D174D";
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.fillText("CAFE MEMORIES", centerX, y + 50);
    ctx.font = "12px monospace";
    ctx.fillText("GUEST CHECK", centerX, y + 72);

    ctx.fillStyle = "#FEF08A";
    ctx.fillRect(x + 15, y + 120, w - 30, 110);
    ctx.fillStyle = "#854D0E";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("SPECIAL DAY", centerX, y + 155);
    ctx.font = "12px monospace";
    ctx.fillText(stripLabel, centerX, y + 185);
    ctx.fillText(new Date().toLocaleDateString("id-ID"), centerX, y + 210);

    // Bottom note
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px monospace";
    ctx.fillText(watermarkText, centerX, y + 430);
  } else if (themeStyle === "POP_YELLOW") {
    ctx.fillStyle = "#18181B";
    ctx.textAlign = "center";
    ctx.font = "900 24px sans-serif";
    ctx.fillText("HAPPY DAY", centerX, y + 70);

    ctx.font = "bold 13px monospace";
    ctx.fillText("★ PHOTO EVENT ★", centerX, y + 105);

    ctx.fillStyle = "#18181B";
    ctx.fillRect(x + 15, y + 150, w - 30, 80);
    ctx.fillStyle = "#FACC15";
    ctx.font = "bold 15px monospace";
    ctx.fillText(stripLabel, centerX, y + 195);

    ctx.fillStyle = "#18181B";
    ctx.font = "12px monospace";
    ctx.fillText(watermarkText, centerX, y + 360);
    ctx.fillText(new Date().toLocaleDateString("id-ID"), centerX, y + 390);
  } else {
    // CLASSIC STUDIO MINIMAL
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";

    ctx.font = "bold 22px sans-serif";
    ctx.fillText(watermarkText, centerX, y + 80);

    ctx.font = "13px monospace";
    ctx.globalAlpha = 0.7;
    ctx.fillText(stripLabel, centerX, y + 115);

    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    ctx.fillText(dateStr, centerX, y + 145);

    // Minimal vertical bar
    ctx.fillRect(centerX - 40, y + 180, 80, 2);

    ctx.font = "11px monospace";
    ctx.fillText("AUTHENTIC FILM", centerX, y + 220);
    ctx.fillText("300 DPI • STUDIO", centerX, y + 245);

    // Minimal barcode
    drawBarcode(ctx, x + 35, y + 360, w - 70, 65, textColor);
  }

  ctx.restore();
}

// ----------------------------------------------------
// POLAROID RENDERER
// ----------------------------------------------------

function renderSinglePolaroidCard(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  width: number,
  height: number,
  photos: HTMLImageElement[],
  themeStyle: string,
  frameColor: string,
  filter: string,
  watermarkText: string,
  cardLabel: string
) {
  ctx.save();

  // Background
  drawThemeBackground(ctx, offsetX, 0, width, height, themeStyle, frameColor);

  // 2 Landscape Photos stacked
  const marginX = 65;
  const slotWidth = width - marginX * 2; // 770 px
  const slotHeight = 440;
  const startY = 60;
  const gapY = 40;

  for (let i = 0; i < Math.min(2, photos.length); i++) {
    const y = startY + i * (slotHeight + gapY);
    drawCroppedImage(ctx, photos[i], offsetX + marginX, y, slotWidth, slotHeight, filter);
  }

  // Polaroid Bottom Chin (Handwritten label)
  ctx.save();
  ctx.fillStyle = isLightColor(frameColor) ? "#27272A" : "#F4F4F5";
  ctx.font = "italic 32px serif";
  ctx.textAlign = "center";
  ctx.fillText("Sweet Memories", offsetX + width / 2, height - 100);

  ctx.font = "14px monospace";
  ctx.globalAlpha = 0.6;
  ctx.fillText(`${cardLabel} • ${watermarkText} • ${new Date().toLocaleDateString("id-ID")}`, offsetX + width / 2, height - 60);
  ctx.restore();

  ctx.restore();
}

// ----------------------------------------------------
// THEME BACKGROUNDS & HELPERS
// ----------------------------------------------------

function drawThemeBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  themeStyle: string,
  frameColor: string
) {
  if (themeStyle === "THEATER_TICKET") {
    ctx.fillStyle = "#FDF8F0";
    ctx.fillRect(x, y, w, h);
  } else if (themeStyle === "Y2K_CHECKER") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x, y, w, h);
    drawCheckerPattern(ctx, x, y, w, h, "#1E3A8A");
  } else if (themeStyle === "GREEN_CAFE") {
    ctx.fillStyle = "#15803D";
    ctx.fillRect(x, y, w, h);
  } else if (themeStyle === "POP_YELLOW") {
    ctx.fillStyle = "#FACC15";
    ctx.fillRect(x, y, w, h);
  } else {
    // CLASSIC
    ctx.fillStyle = frameColor || "#FFFFFF";
    ctx.fillRect(x, y, w, h);
  }
}

function getThemeBaseColor(themeStyle: string): string {
  if (themeStyle === "THEATER_TICKET") return "#FDF8F0";
  if (themeStyle === "Y2K_CHECKER") return "#FFFFFF";
  if (themeStyle === "GREEN_CAFE") return "#15803D";
  if (themeStyle === "POP_YELLOW") return "#FACC15";
  return "#FFFFFF";
}

// Center-crop & filter helper
function drawCroppedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  filter: string
) {
  ctx.save();

  const radius = 6;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();

  const imgW = img.width || 600;
  const imgH = img.height || 450;
  const imgRatio = imgW / imgH;
  const slotRatio = w / h;
  let sWidth = imgW;
  let sHeight = imgH;
  let sX = 0;
  let sY = 0;

  if (imgRatio > slotRatio) {
    sWidth = imgH * slotRatio;
    sX = (imgW - sWidth) / 2;
  } else {
    sHeight = imgW / slotRatio;
    sY = (imgH - sHeight) / 2;
  }

  ctx.drawImage(img, sX, sY, sWidth, sHeight, x, y, w, h);

  // Apply Pixel Filter
  if (filter === "BW") {
    const imgData = ctx.getImageData(x, y, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    ctx.putImageData(imgData, x, y);
  } else if (filter === "VINTAGE") {
    const imgData = ctx.getImageData(x, y, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
    ctx.putImageData(imgData, x, y);
  } else if (filter === "WARM") {
    ctx.fillStyle = "rgba(255, 140, 0, 0.14)";
    ctx.fillRect(x, y, w, h);
  } else if (filter === "COLD") {
    ctx.fillStyle = "rgba(0, 150, 255, 0.14)";
    ctx.fillRect(x, y, w, h);
  }

  ctx.restore();
}

function drawCheckerPattern(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  const size = 18;

  for (let y = offsetY; y < offsetY + h; y += size) {
    const isOdd = Math.floor(y / size) % 2 === 0;
    if (isOdd) {
      ctx.fillRect(offsetX, y, size, size);
      ctx.fillRect(offsetX + w - size, y, size, size);
    }
  }
  ctx.restore();
}

function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  const barCount = 34;
  const unit = w / barCount;

  for (let i = 0; i < barCount; i++) {
    const isThick = i % 3 === 0 || i % 7 === 0;
    const isSkip = i % 5 === 0 && i % 2 !== 0;
    if (!isSkip) {
      const barW = isThick ? unit * 1.5 : unit * 0.8;
      ctx.fillRect(x + i * unit, y, barW, h);
    }
  }
  ctx.restore();
}

function drawVerticalBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  const barCount = 28;
  const unit = h / barCount;

  for (let i = 0; i < barCount; i++) {
    const isThick = i % 3 === 0 || i % 6 === 0;
    const isSkip = i % 7 === 0;
    if (!isSkip) {
      const barH = isThick ? unit * 1.4 : unit * 0.7;
      ctx.fillRect(x, y + i * unit, w, barH);
    }
  }
  ctx.restore();
}

function isLightColor(hex: string): boolean {
  if (!hex || !hex.startsWith("#")) return true;
  const r = parseInt(hex.slice(1, 3), 16) || 255;
  const g = parseInt(hex.slice(3, 5), 16) || 255;
  const b = parseInt(hex.slice(5, 7), 16) || 255;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140;
}
