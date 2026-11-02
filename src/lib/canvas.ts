export interface StickerItem {
  id: string;
  emoji: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  scale: number;
  rotation: number; // degrees
}

export interface RenderOptions {
  layoutType: string;
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

// 300 DPI Standard 4R Portrait Dimensions:
// 4 inch x 6 inch = 1200 x 1800 px (Semua Frame Lurus Vertikal)
export async function renderCompositeCanvas(
  options: RenderOptions
): Promise<string> {
  const {
    layoutType,
    photos = [],
    filter,
    frameColor,
    stickers = [],
    watermarkText = "Rebooth • Photobooth",
    themeStyle = "CLASSIC",
  } = options;

  const canvasWidth = 1200;
  const canvasHeight = 1800;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Gagal menginisialisasi canvas.");

  // Determine needed photo count
  let targetCount = 3;
  if (layoutType === "STRIP_2X6_4") targetCount = 4;

  const imageSources = Array.from({ length: Math.max(targetCount, photos.length) }).map(
    (_, idx) => photos[idx] || photos[0] || ""
  );
  const loadedImages: HTMLImageElement[] = await Promise.all(
    imageSources.map((src) => loadImageSafely(src))
  );

  // ====================================================
  // 1. STRIP_2X6_3 (2x6" 3 PHOTO - 2 VERTICAL STRIPS)
  // ====================================================
  if (layoutType === "STRIP_2X6_3") {
    const stripWidth = 600;
    const stripHeight = 1800;

    const strip1Photos = [loadedImages[0], loadedImages[1], loadedImages[2]];
    const strip2Photos = [
      loadedImages[3] || loadedImages[0],
      loadedImages[4] || loadedImages[1],
      loadedImages[5] || loadedImages[2],
    ];

    renderVerticalStrip(
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
      "STRIP 1 • 3-CUTS",
      3
    );

    renderVerticalStrip(
      ctx,
      stripWidth,
      0,
      stripWidth,
      stripHeight,
      strip2Photos,
      themeStyle,
      frameColor,
      filter,
      watermarkText,
      "STRIP 2 • 3-CUTS",
      3
    );

    // Subtle dashed center cut line guide between twin strips
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(stripWidth, 24);
    ctx.lineTo(stripWidth, stripHeight - 24);
    ctx.stroke();
    ctx.restore();
  }

  // ====================================================
  // 2. STRIP_2X6_4 (2x6" 4 PHOTO - KOREAN LIFE4CUTS)
  // ====================================================
  else if (layoutType === "STRIP_2X6_4") {
    const stripWidth = 600;
    const stripHeight = 1800;

    const strip1Photos = [loadedImages[0], loadedImages[1], loadedImages[2], loadedImages[3]];
    const strip2Photos = [
      loadedImages[4] || loadedImages[0],
      loadedImages[5] || loadedImages[1],
      loadedImages[6] || loadedImages[2],
      loadedImages[7] || loadedImages[3],
    ];

    renderVerticalStrip(
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
      "STRIP 1 • 4-CUTS",
      4
    );

    renderVerticalStrip(
      ctx,
      stripWidth,
      0,
      stripWidth,
      stripHeight,
      strip2Photos,
      themeStyle,
      frameColor,
      filter,
      watermarkText,
      "STRIP 2 • 4-CUTS",
      4
    );

    // Subtle dashed center cut line guide between twin strips
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(stripWidth, 24);
    ctx.lineTo(stripWidth, stripHeight - 24);
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
// VERTICAL STRIP RENDERER (600 x 1800 px)
// ----------------------------------------------------

function renderVerticalStrip(
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
  stripLabel: string,
  photosCount: 3 | 4
) {
  ctx.save();

  // 1. Draw Background
  drawThemeBackground(ctx, originX, originY, width, height, themeStyle, frameColor);

  const marginX = 45;
  const slotWidth = width - marginX * 2; // 510 px

  if (photosCount === 3) {
    const slotHeight = 445;
    const startY = 40;
    const gapY = 22;

    for (let i = 0; i < Math.min(3, photos.length); i++) {
      const y = startY + i * (slotHeight + gapY);
      drawCroppedImage(ctx, photos[i], originX + marginX, y, slotWidth, slotHeight, filter);
    }

    const footerY = startY + 3 * (slotHeight + gapY) + 20;
    const footerHeight = height - footerY - 30;
    renderStripBrandingFooter(
      ctx,
      originX + marginX,
      footerY,
      slotWidth,
      footerHeight,
      themeStyle,
      frameColor,
      watermarkText,
      stripLabel
    );
  } else {
    // 4 photos
    const slotHeight = 340;
    const startY = 35;
    const gapY = 16;

    for (let i = 0; i < Math.min(4, photos.length); i++) {
      const y = startY + i * (slotHeight + gapY);
      drawCroppedImage(ctx, photos[i], originX + marginX, y, slotWidth, slotHeight, filter);
    }

    const footerY = startY + 4 * (slotHeight + gapY) + 20;
    const footerHeight = height - footerY - 30;
    renderStripBrandingFooter(
      ctx,
      originX + marginX,
      footerY,
      slotWidth,
      footerHeight,
      themeStyle,
      frameColor,
      watermarkText,
      stripLabel
    );
  }

  ctx.restore();
}

// ----------------------------------------------------
// EDITORIAL STRIP BRANDING FOOTER (Bottom of vertical strip)
// ----------------------------------------------------

function renderStripBrandingFooter(
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
    const boxMargin = 4;
    const boxHeight = h - boxMargin * 2;
    ctx.strokeStyle = maroon;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + boxMargin, w, boxHeight);

    ctx.fillStyle = maroon;
    ctx.textAlign = "center";
    ctx.font = "900 22px serif";
    ctx.fillText("ADMIT ONE", centerX, y + boxMargin + 32);

    ctx.font = "italic 13px serif";
    ctx.fillText("CINEMA PASS", centerX, y + boxMargin + 52);

    ctx.font = "bold 12px monospace";
    ctx.fillText(stripLabel, centerX, y + boxMargin + 80);

    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
    ctx.font = "11px monospace";
    ctx.fillText(dateStr, centerX, y + boxMargin + 102);
    ctx.fillText("SEAT A-04 • ROW 1", centerX, y + boxMargin + 120);

    drawBarcode(ctx, x + 35, y + boxMargin + 140, w - 70, 48, maroon);

    ctx.font = "10px monospace";
    ctx.fillText(watermarkText, centerX, y + boxMargin + boxHeight - 16);
  } else if (themeStyle === "Y2K_CHECKER") {
    const blue = "#1E3A8A";
    ctx.fillStyle = blue;
    ctx.textAlign = "center";

    ctx.font = "900 24px monospace";
    ctx.fillText("RADICAL", centerX, y + 36);

    ctx.font = "bold 14px monospace";
    ctx.fillText("MOMENT", centerX, y + 60);

    ctx.fillStyle = "#FBBF24";
    ctx.fillRect(x + 20, y + 78, w - 40, 36);
    ctx.fillStyle = blue;
    ctx.font = "bold 13px monospace";
    ctx.fillText(stripLabel, centerX, y + 102);

    ctx.font = "11px monospace";
    ctx.fillText("REBOOTH • 2026", centerX, y + 136);
    ctx.fillText("AUTHENTIC STUDIO SHOT", centerX, y + 154);

    drawBarcode(ctx, x + 30, y + 170, w - 60, 48, blue);

    ctx.font = "10px monospace";
    ctx.fillText(watermarkText, centerX, y + h - 16);
  } else if (themeStyle === "GREEN_CAFE") {
    ctx.fillStyle = "#FCE7F3";
    ctx.fillRect(x, y + 6, w, 44);
    ctx.strokeStyle = "#DB2777";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 6, w, 44);

    ctx.fillStyle = "#9D174D";
    ctx.font = "bold 15px serif";
    ctx.textAlign = "center";
    ctx.fillText("CAFE MEMORIES", centerX, y + 25);
    ctx.font = "11px monospace";
    ctx.fillText("GUEST CHECK", centerX, y + 40);

    ctx.fillStyle = "#FEF08A";
    ctx.fillRect(x, y + 58, w, 56);
    ctx.fillStyle = "#854D0E";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("SPECIAL DAY", centerX, y + 80);
    ctx.font = "11px monospace";
    ctx.fillText(stripLabel, centerX, y + 98);

    drawBarcode(ctx, x + 30, y + 128, w - 60, 46, "#FFFFFF");

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px monospace";
    ctx.fillText(watermarkText, centerX, y + h - 16);
  } else if (themeStyle === "POP_YELLOW") {
    ctx.fillStyle = "#18181B";
    ctx.textAlign = "center";
    ctx.font = "900 24px sans-serif";
    ctx.fillText("HAPPY DAY", centerX, y + 36);

    ctx.font = "bold 13px monospace";
    ctx.fillText("★ PHOTO EVENT ★", centerX, y + 60);

    ctx.fillStyle = "#18181B";
    ctx.fillRect(x + 20, y + 78, w - 40, 36);
    ctx.fillStyle = "#FACC15";
    ctx.font = "bold 13px monospace";
    ctx.fillText(stripLabel, centerX, y + 102);

    drawBarcode(ctx, x + 30, y + 134, w - 60, 46, "#18181B");

    ctx.fillStyle = "#18181B";
    ctx.font = "10px monospace";
    ctx.fillText(watermarkText, centerX, y + h - 16);
  } else {
    // CLASSIC STUDIO MINIMAL
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";

    ctx.font = "bold 20px sans-serif";
    ctx.fillText(watermarkText, centerX, y + 38);

    ctx.font = "12px monospace";
    ctx.globalAlpha = 0.7;
    ctx.fillText(stripLabel, centerX, y + 64);

    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    ctx.fillText(dateStr, centerX, y + 88);

    ctx.fillRect(centerX - 45, y + 104, 90, 2);

    ctx.font = "10px monospace";
    ctx.fillText("AUTHENTIC FILM STUDIO", centerX, y + 126);

    drawBarcode(ctx, x + 35, y + 144, w - 70, 48, textColor);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ----------------------------------------------------
// POSTCARD & POLAROID FOOTER HELPERS
// ----------------------------------------------------

function renderPostcardFooter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  themeStyle: string,
  frameColor: string,
  watermarkText: string,
  collectionTitle: string
) {
  const isLight = isLightColor(themeStyle === "CLASSIC" ? frameColor : getThemeBaseColor(themeStyle));
  const textColor = isLight ? "#18181B" : "#F4F4F5";

  ctx.save();
  ctx.fillStyle = textColor;
  ctx.textAlign = "left";

  // Divider Line
  ctx.strokeStyle = isLight ? "rgba(24, 24, 27, 0.15)" : "rgba(244, 244, 245, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();

  // Left Notes
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(watermarkText, x, y + 45);

  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  ctx.font = "14px monospace";
  ctx.globalAlpha = 0.7;
  ctx.fillText(`${collectionTitle} • ${dateStr}`, x, y + 75);
  ctx.fillText("REBOOTH SELF-SERVICE PHOTO STUDIO", x, y + 98);

  // Note lines
  ctx.strokeStyle = isLight ? "rgba(24, 24, 27, 0.1)" : "rgba(244, 244, 245, 0.15)";
  ctx.setLineDash([4, 4]);
  for (let line = 0; line < 4; line++) {
    const lineY = y + 140 + line * 32;
    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + 520, lineY);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Right Stamp Box & Barcode
  const stampX = x + w - 140;
  const stampY = y + 30;
  ctx.strokeRect(stampX, stampY, 140, 160);
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("POSTAGE", stampX + 70, stampY + 40);
  ctx.fillText("STAMP", stampX + 70, stampY + 60);
  ctx.fillText("300 DPI", stampX + 70, stampY + 130);

  drawBarcode(ctx, x + w - 460, y + 220, 460, 60, textColor);
  ctx.restore();
}

function renderPolaroidChin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  themeStyle: string,
  frameColor: string,
  watermarkText: string,
  scriptTitle: string
) {
  const isLight = isLightColor(themeStyle === "CLASSIC" ? frameColor : getThemeBaseColor(themeStyle));
  const textColor = isLight ? "#18181B" : "#F4F4F5";

  ctx.save();
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";

  const centerX = x + w / 2;
  ctx.font = "italic 44px serif";
  ctx.fillText(scriptTitle, centerX, y + 70);

  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  ctx.font = "14px monospace";
  ctx.globalAlpha = 0.7;
  ctx.fillText(`${watermarkText} • ${dateStr}`, centerX, y + 115);

  drawBarcode(ctx, centerX - 180, y + 150, 360, 60, textColor);
  ctx.restore();
}

// ----------------------------------------------------
// THEME BACKGROUNDS & HELPERS
// ----------------------------------------------------

export const THEME_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  CLASSIC: { bg: "#FFFFFF", text: "#18181B", border: "#E4E4E7" },
  THEATER_TICKET: { bg: "#FDF8F0", text: "#881337", border: "#881337" },
  Y2K_CHECKER: { bg: "#1E3A8A", text: "#FFFFFF", border: "#1E3A8A" },
  GREEN_CAFE: { bg: "#15803D", text: "#FFFFFF", border: "#15803D" },
  POP_YELLOW: { bg: "#FACC15", text: "#18181B", border: "#18181B" },
  FILM_NOIR: { bg: "#1C1917", text: "#F5F5F4", border: "#44403C" },
  CHERRY_BLOSSOM: { bg: "#FFF1F2", text: "#9F1239", border: "#FDA4AF" },
  CYBER_NEON: { bg: "#0F0B15", text: "#A855F7", border: "#7C3AED" },
  RETRO_COMIC: { bg: "#FEF9C3", text: "#B91C1C", border: "#DC2626" },
  SUNSET_WARM: { bg: "#FFF7ED", text: "#9A3412", border: "#FB923C" },
  OCEAN_BREEZE: { bg: "#F0F9FF", text: "#0C4A6E", border: "#38BDF8" },
  FOREST_MOSS: { bg: "#F0FDF4", text: "#14532D", border: "#4ADE80" },
};

function drawThemeBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  themeStyle: string,
  frameColor: string
) {
  if (themeStyle === "CLASSIC") {
    ctx.fillStyle = frameColor || "#FFFFFF";
    ctx.fillRect(x, y, w, h);
    return;
  }

  const theme = THEME_COLOR_MAP[themeStyle];
  if (theme) {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(x, y, w, h);
    if (themeStyle === "Y2K_CHECKER") {
      drawCheckerPattern(ctx, x, y, w, h, "#1E3A8A");
    }
  } else {
    ctx.fillStyle = frameColor || "#FFFFFF";
    ctx.fillRect(x, y, w, h);
  }
}

function getThemeBaseColor(themeStyle: string): string {
  return THEME_COLOR_MAP[themeStyle]?.bg || "#FFFFFF";
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
    // Top-bias portrait crop: preserve head and hair instead of slicing forehead
    sY = (imgH - sHeight) * 0.2;
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

function isLightColor(hex: string): boolean {
  if (!hex || !hex.startsWith("#")) return true;
  const r = parseInt(hex.slice(1, 3), 16) || 255;
  const g = parseInt(hex.slice(3, 5), 16) || 255;
  const b = parseInt(hex.slice(5, 7), 16) || 255;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140;
}

// Helper: Slice composite sheet into standalone individual strips for social media / separate download
export async function exportStripsFromComposite(
  compositeDataUrl: string,
  layoutType: string
): Promise<{ strip1: string; strip2: string } | null> {
  const isStripLayout =
    layoutType.startsWith("STRIP_") || layoutType === "STRIP_2X6";

  if (!isStripLayout) {
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const stripW = Math.round(img.width / 2); // 600 px
        const stripH = img.height; // 1800 px

        // Strip 1 (Left Half)
        const canvas1 = document.createElement("canvas");
        canvas1.width = stripW;
        canvas1.height = stripH;
        const ctx1 = canvas1.getContext("2d");
        if (ctx1) {
          ctx1.drawImage(img, 0, 0, stripW, stripH, 0, 0, stripW, stripH);
        }

        // Strip 2 (Right Half)
        const canvas2 = document.createElement("canvas");
        canvas2.width = stripW;
        canvas2.height = stripH;
        const ctx2 = canvas2.getContext("2d");
        if (ctx2) {
          ctx2.drawImage(img, stripW, 0, stripW, stripH, 0, 0, stripW, stripH);
        }

        resolve({
          strip1: canvas1.toDataURL("image/png", 0.95),
          strip2: canvas2.toDataURL("image/png", 0.95),
        });
      } catch (err) {
        console.error("Failed to slice strips:", err);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = compositeDataUrl;
  });
}
