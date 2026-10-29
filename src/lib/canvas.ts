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
    watermarkText = "KioskSnap • Photobooth",
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
  let targetCount = 4;
  if (layoutType === "STRIP_2X6_3" || layoutType === "STRIP_2X6") targetCount = 3;
  else if (layoutType === "STRIP_2X6_4") targetCount = 4;
  else if (layoutType === "CARD_4X6_6") targetCount = 6;
  else if (layoutType === "CARD_4X6_4" || layoutType === "GRID_4X6") targetCount = 4;
  else if (layoutType === "CARD_4X6_TRIPLE") targetCount = 3;
  else if (layoutType === "CARD_4X6_2" || layoutType === "POLAROID") targetCount = 2;
  else if (layoutType === "CARD_4X6_1") targetCount = 1;

  const imageSources = Array.from({ length: Math.max(targetCount, photos.length) }).map(
    (_, idx) => photos[idx] || photos[0] || ""
  );
  const loadedImages: HTMLImageElement[] = await Promise.all(
    imageSources.map((src) => loadImageSafely(src))
  );

  // ====================================================
  // 1. STRIP_2X6_3 (2x6" 3 PHOTO - 2 VERTICAL STRIPS)
  // ====================================================
  if (layoutType === "STRIP_2X6_3" || layoutType === "STRIP_2X6") {
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

    drawPerforationCutLine(ctx, stripWidth, stripHeight);
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

    drawPerforationCutLine(ctx, stripWidth, stripHeight);
  }

  // ====================================================
  // 3. CARD_4X6_6 (4x6" 6 PHOTO - 2x3 GRID PORTRAIT)
  // ====================================================
  else if (layoutType === "CARD_4X6_6") {
    drawThemeBackground(ctx, 0, 0, canvasWidth, canvasHeight, themeStyle, frameColor);

    const marginX = 55;
    const gapX = 25;
    const slotWidth = 532;
    const slotHeight = 350;
    const startY = 60;
    const gapY = 22;

    const positions = [
      { x: marginX, y: startY },
      { x: marginX + slotWidth + gapX, y: startY },
      { x: marginX, y: startY + slotHeight + gapY },
      { x: marginX + slotWidth + gapX, y: startY + slotHeight + gapY },
      { x: marginX, y: startY + (slotHeight + gapY) * 2 },
      { x: marginX + slotWidth + gapX, y: startY + (slotHeight + gapY) * 2 },
    ];

    for (let i = 0; i < 6; i++) {
      const img = loadedImages[i] || loadedImages[0];
      drawCroppedImage(ctx, img, positions[i].x, positions[i].y, slotWidth, slotHeight, filter);
    }

    const footerY = startY + 3 * (slotHeight + gapY) + 20;
    renderPostcardFooter(
      ctx,
      marginX,
      footerY,
      canvasWidth - marginX * 2,
      themeStyle,
      frameColor,
      watermarkText,
      "6-SHOTS GRID PHOTO CARD"
    );
  }

  // ====================================================
  // 4. CARD_4X6_4 (4x6" 4 PHOTO - 2x2 GRID PORTRAIT)
  // ====================================================
  else if (layoutType === "CARD_4X6_4" || layoutType === "GRID_4X6") {
    drawThemeBackground(ctx, 0, 0, canvasWidth, canvasHeight, themeStyle, frameColor);

    const marginX = 55;
    const gapX = 30;
    const slotWidth = 530;
    const slotHeight = 440;
    const startY = 80;
    const gapY = 30;

    const positions = [
      { x: marginX, y: startY },
      { x: marginX + slotWidth + gapX, y: startY },
      { x: marginX, y: startY + slotHeight + gapY },
      { x: marginX + slotWidth + gapX, y: startY + slotHeight + gapY },
    ];

    for (let i = 0; i < 4; i++) {
      const img = loadedImages[i] || loadedImages[0];
      drawCroppedImage(ctx, img, positions[i].x, positions[i].y, slotWidth, slotHeight, filter);
    }

    const footerY = startY + 2 * (slotHeight + gapY) + 30;
    renderPostcardFooter(
      ctx,
      marginX,
      footerY,
      canvasWidth - marginX * 2,
      themeStyle,
      frameColor,
      watermarkText,
      "4-SHOTS MODERN POSTCARD"
    );
  }

  // ====================================================
  // 5. CARD_4X6_TRIPLE (4x6" TRIPLE PHOTO - 3 VERTICAL SLOTS)
  // ====================================================
  else if (layoutType === "CARD_4X6_TRIPLE") {
    drawThemeBackground(ctx, 0, 0, canvasWidth, canvasHeight, themeStyle, frameColor);

    const marginX = 45;
    const gapX = 20;
    const slotWidth = Math.round((canvasWidth - marginX * 2 - gapX * 2) / 3); // ~356 px
    const slotHeight = 880;
    const startY = 90;

    for (let i = 0; i < 3; i++) {
      const x = marginX + i * (slotWidth + gapX);
      const img = loadedImages[i] || loadedImages[0];
      drawCroppedImage(ctx, img, x, startY, slotWidth, slotHeight, filter);
    }

    const footerY = startY + slotHeight + 45;
    renderPostcardFooter(
      ctx,
      marginX,
      footerY,
      canvasWidth - marginX * 2,
      themeStyle,
      frameColor,
      watermarkText,
      "TRIPLE PHOTO EDITORIAL"
    );
  }

  // ====================================================
  // 6. CARD_4X6_2 (4x6" 2 PHOTO - DUO POLAROID / STACKED)
  // ====================================================
  else if (layoutType === "CARD_4X6_2" || layoutType === "POLAROID") {
    drawThemeBackground(ctx, 0, 0, canvasWidth, canvasHeight, themeStyle, frameColor);

    const marginX = 60;
    const slotWidth = canvasWidth - marginX * 2; // 1080 px
    const slotHeight = 520;
    const startY = 80;
    const gapY = 35;

    drawCroppedImage(ctx, loadedImages[0], marginX, startY, slotWidth, slotHeight, filter);
    drawCroppedImage(
      ctx,
      loadedImages[1] || loadedImages[0],
      marginX,
      startY + slotHeight + gapY,
      slotWidth,
      slotHeight,
      filter
    );

    const footerY = startY + 2 * slotHeight + gapY + 40;
    renderPolaroidChin(
      ctx,
      marginX,
      footerY,
      slotWidth,
      canvasHeight - footerY - 40,
      themeStyle,
      frameColor,
      watermarkText,
      "Together Forever"
    );
  }

  // ====================================================
  // 7. CARD_4X6_1 (4x6" PORTRAIT SINGLE PHOTO - POLAROID JUMBO)
  // ====================================================
  else if (layoutType === "CARD_4X6_1") {
    drawThemeBackground(ctx, 0, 0, canvasWidth, canvasHeight, themeStyle, frameColor);

    const marginX = 60;
    const slotWidth = canvasWidth - marginX * 2; // 1080 px
    const slotHeight = 1240;
    const startY = 70;

    drawCroppedImage(ctx, loadedImages[0], marginX, startY, slotWidth, slotHeight, filter);

    const footerY = startY + slotHeight + 35;
    renderPolaroidChin(
      ctx,
      marginX,
      footerY,
      slotWidth,
      canvasHeight - footerY - 40,
      themeStyle,
      frameColor,
      watermarkText,
      "Sweet Memories"
    );
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
    const slotHeight = 382;
    const startY = 50;
    const gapY = 24;

    for (let i = 0; i < Math.min(3, photos.length); i++) {
      const y = startY + i * (slotHeight + gapY);
      drawCroppedImage(ctx, photos[i], originX + marginX, y, slotWidth, slotHeight, filter);
    }

    const footerY = startY + 3 * (slotHeight + gapY) + 20;
    const footerHeight = height - footerY - 40;
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
    const slotHeight = 300;
    const startY = 40;
    const gapY = 18;

    for (let i = 0; i < Math.min(4, photos.length); i++) {
      const y = startY + i * (slotHeight + gapY);
      drawCroppedImage(ctx, photos[i], originX + marginX, y, slotWidth, slotHeight, filter);
    }

    const footerY = startY + 4 * (slotHeight + gapY) + 20;
    const footerHeight = height - footerY - 40;
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

function drawPerforationCutLine(
  ctx: CanvasRenderingContext2D,
  stripWidth: number,
  stripHeight: number
) {
  ctx.save();
  ctx.strokeStyle = "rgba(161, 161, 170, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(stripWidth, 0);
  ctx.lineTo(stripWidth, stripHeight);
  ctx.stroke();

  ctx.fillStyle = "rgba(113, 113, 122, 0.75)";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.fillText("✄ POTONG DI SINI", stripWidth, 32);
  ctx.fillText("✄ POTONG DI SINI", stripWidth, stripHeight - 20);
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
    ctx.strokeStyle = maroon;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 10, w, h - 20);

    ctx.fillStyle = maroon;
    ctx.textAlign = "center";
    ctx.font = "900 24px serif";
    ctx.fillText("ADMIT ONE", centerX, y + 55);

    ctx.font = "italic 14px serif";
    ctx.fillText("CINEMA PASS", centerX, y + 80);

    ctx.font = "bold 13px monospace";
    ctx.fillText(stripLabel, centerX, y + 120);

    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
    ctx.font = "12px monospace";
    ctx.fillText(dateStr, centerX, y + 148);
    ctx.fillText("SEAT A-04 • ROW 1", centerX, y + 170);

    drawBarcode(ctx, x + 35, y + 205, w - 70, 55, maroon);

    ctx.font = "10px monospace";
    ctx.fillText(watermarkText, centerX, y + h - 30);
  } else if (themeStyle === "Y2K_CHECKER") {
    const blue = "#1E3A8A";
    ctx.fillStyle = blue;
    ctx.textAlign = "center";

    ctx.font = "900 26px monospace";
    ctx.fillText("RADICAL", centerX, y + 50);

    ctx.font = "bold 15px monospace";
    ctx.fillText("MOMENT", centerX, y + 78);

    ctx.fillStyle = "#FBBF24";
    ctx.fillRect(x + 20, y + 105, w - 40, 42);
    ctx.fillStyle = blue;
    ctx.font = "bold 14px monospace";
    ctx.fillText(stripLabel, centerX, y + 132);

    ctx.font = "12px monospace";
    ctx.fillText("KIOSKSNAP • 2026", centerX, y + 180);
    ctx.fillText("AUTHENTIC STUDIO SHOT", centerX, y + 202);

    drawBarcode(ctx, x + 30, y + 230, w - 60, 58, blue);

    ctx.font = "10px monospace";
    ctx.fillText(watermarkText, centerX, y + h - 30);
  } else if (themeStyle === "GREEN_CAFE") {
    ctx.fillStyle = "#FCE7F3";
    ctx.fillRect(x, y + 10, w, 60);
    ctx.strokeStyle = "#DB2777";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 10, w, 60);

    ctx.fillStyle = "#9D174D";
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.fillText("CAFE MEMORIES", centerX, y + 36);
    ctx.font = "12px monospace";
    ctx.fillText("GUEST CHECK", centerX, y + 55);

    ctx.fillStyle = "#FEF08A";
    ctx.fillRect(x, y + 88, w, 75);
    ctx.fillStyle = "#854D0E";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("SPECIAL DAY", centerX, y + 118);
    ctx.font = "12px monospace";
    ctx.fillText(stripLabel, centerX, y + 138);
    ctx.fillText(new Date().toLocaleDateString("id-ID"), centerX, y + 154);

    drawBarcode(ctx, x + 30, y + 185, w - 60, 55, "#FFFFFF");

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "11px monospace";
    ctx.fillText(watermarkText, centerX, y + h - 30);
  } else if (themeStyle === "POP_YELLOW") {
    ctx.fillStyle = "#18181B";
    ctx.textAlign = "center";
    ctx.font = "900 26px sans-serif";
    ctx.fillText("HAPPY DAY", centerX, y + 50);

    ctx.font = "bold 14px monospace";
    ctx.fillText("★ PHOTO EVENT ★", centerX, y + 82);

    ctx.fillStyle = "#18181B";
    ctx.fillRect(x + 20, y + 110, w - 40, 48);
    ctx.fillStyle = "#FACC15";
    ctx.font = "bold 15px monospace";
    ctx.fillText(stripLabel, centerX, y + 140);

    drawBarcode(ctx, x + 30, y + 185, w - 60, 55, "#18181B");

    ctx.fillStyle = "#18181B";
    ctx.font = "11px monospace";
    ctx.fillText(watermarkText, centerX, y + h - 30);
  } else {
    // CLASSIC STUDIO MINIMAL
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";

    ctx.font = "bold 22px sans-serif";
    ctx.fillText(watermarkText, centerX, y + 55);

    ctx.font = "13px monospace";
    ctx.globalAlpha = 0.7;
    ctx.fillText(stripLabel, centerX, y + 88);

    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    ctx.fillText(dateStr, centerX, y + 115);

    ctx.fillRect(centerX - 50, y + 138, 100, 2);

    ctx.font = "11px monospace";
    ctx.fillText("AUTHENTIC FILM", centerX, y + 170);
    ctx.fillText("300 DPI • STUDIO", centerX, y + 192);

    drawBarcode(ctx, x + 35, y + 215, w - 70, 58, textColor);
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
  ctx.fillText("KIOSKSNAP SELF-SERVICE PHOTO STUDIO", x, y + 98);

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
