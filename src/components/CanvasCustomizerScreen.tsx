"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Clock,
  Smile,
  Sliders,
  CheckCircle2,
  Trash2,
  RotateCw,
  Plus,
  Minus,
  RotateCcw,
  LayoutTemplate,
  ChevronRight,
  Maximize2,
  Copy,
  Sparkles,
} from "lucide-react";
import { renderCompositeCanvas, StickerItem } from "@/lib/canvas";
import { sounds } from "@/lib/sound";

interface CanvasCustomizerScreenProps {
  layoutType: string;
  photos: string[];
  sessionSecondsLeft: number;
  watermarkText?: string;
  initialThemeId?: string;
  initialFrameColor?: string;
  onFinishCustomization: (finalDataUrl: string, stickers: StickerItem[], filter: string, frameColor: string) => void;
  onRetakePhotos: () => void;
  onTimeExpired: () => void;
}

const STICKER_LIST = [
  "🎀", "🐱", "🌸", "👑", "💖", "🐰", "🕶️", "👒", "🍰", "🎈", "🍒", "🌷", "🧸", "🤍", "☕", "📸"
];

const THEME_OPTIONS = [
  { id: "CLASSIC", name: "Studio Minimal", desc: "Border bersih warna solid" },
  { id: "THEATER_TICKET", name: "Archive Ticket", desc: "Vintage tiket bioskop & barcode" },
  { id: "Y2K_CHECKER", name: "Y2K Street", desc: "Checkerboard retro starburst" },
  { id: "GREEN_CAFE", name: "Seoul Cafe", desc: "Retro diner guest check" },
  { id: "POP_YELLOW", name: "Rad Yellow", desc: "Bold high-contrast pop" },
  { id: "FILM_NOIR", name: "Film Noir", desc: "Gritty monokrom sinematik" },
  { id: "CHERRY_BLOSSOM", name: "Cherry Blossom", desc: "Pastel Japanese sakura" },
  { id: "CYBER_NEON", name: "Cyber Neon", desc: "Futuristik glow malam" },
  { id: "RETRO_COMIC", name: "Retro Comic", desc: "Halftone pop art bergaya" },
  { id: "SUNSET_WARM", name: "Sunset Gradient", desc: "Hangat keemasan senja" },
  { id: "OCEAN_BREEZE", name: "Ocean Breeze", desc: "Biru laut tenang" },
  { id: "FOREST_MOSS", name: "Forest Moss", desc: "Hijau hutan organik" },
];

const FRAME_COLORS = [
  { name: "Cloud White", hex: "#FFFFFF" },
  { name: "Onyx Black", hex: "#18181B" },
  { name: "Buttercream", hex: "#FEF3C7" },
  { name: "Sakura Pink", hex: "#FCE7F3" },
  { name: "Lavender Mist", hex: "#EDE9FE" },
  { name: "Matcha Sage", hex: "#D1FAE5" },
  { name: "Terracotta", hex: "#FDBA74" },
  { name: "Denim Blue", hex: "#BFDBFE" },
  { name: "Mocha", hex: "#D6D3D1" },
  { name: "Lilac", hex: "#E9D5FF" },
  { name: "Olive", hex: "#D9F99D" },
  { name: "Crimson", hex: "#FECACA" },
  { name: "Teal", hex: "#CCFBF1" },
  { name: "Slate", hex: "#CBD5E1" },
];

const FILTERS = [
  {
    id: "NORMAL",
    name: "Natural",
    tag: "Warna Asli",
    previewGradient: "from-amber-100 to-rose-100",
  },
  {
    id: "BW",
    name: "Monochrome",
    tag: "Hitam Putih",
    previewGradient: "from-zinc-900 to-zinc-400",
  },
  {
    id: "VINTAGE",
    name: "Vintage Sepia",
    tag: "Klasik 90-an",
    previewGradient: "from-amber-700 to-orange-200",
  },
  {
    id: "WARM",
    name: "Golden Warmth",
    tag: "Hangat Cozy",
    previewGradient: "from-amber-400 to-orange-300",
  },
  {
    id: "COLD",
    name: "Tokyo Cool",
    tag: "Sejuk Sinematik",
    previewGradient: "from-sky-400 to-indigo-300",
  },
];

interface InteractiveStickerProps {
  sticker: StickerItem;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<StickerItem>) => void;
  onDelete: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function InteractiveSticker({
  sticker,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  containerRef,
}: InteractiveStickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    onSelect();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: sticker.x,
      origY: sticker.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragStartRef.current.hasMoved = true;
    }

    const dxPct = (dx / rect.width) * 100;
    const dyPct = (dy / rect.height) * 100;

    const nextX = Math.max(5, Math.min(95, +(dragStartRef.current.origX + dxPct).toFixed(1)));
    const nextY = Math.max(4, Math.min(96, +(dragStartRef.current.origY + dyPct).toFixed(1)));

    onUpdate({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
      if (dragStartRef.current.hasMoved) {
        sounds.playClick();
      }
    }
  };

  const handleQuickRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    onUpdate({ rotation: (sticker.rotation + 30) % 360 });
  };

  const handleQuickZoom = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    sounds.playClick();
    onUpdate({
      scale: Math.max(0.5, Math.min(2.4, +(sticker.scale + delta).toFixed(2))),
    });
  };

  const handleQuickDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    onDelete();
  };

  const showToolbarAbove = sticker.y >= 16;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg) scale(${sticker.scale || 1})`,
        transformOrigin: "center center",
        fontSize: "clamp(24px, 6cqi, 64px)",
        lineHeight: 1,
        touchAction: "none",
        zIndex: isSelected ? 30 : 20,
      }}
      className={`absolute select-none cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? "opacity-90" : "opacity-100"
      }`}
      aria-label={`Stiker ${sticker.emoji}`}
    >
      <div
        className={`relative flex items-center justify-center p-1.5 rounded-2xl transition-all ${
          isSelected
            ? "ring-2 ring-zinc-900 bg-white/40 backdrop-blur-xs shadow-md"
            : "hover:bg-white/20"
        }`}
      >
        <span>{sticker.emoji}</span>
      </div>

      {/* Floating mini tactile toolbar when selected */}
      {isSelected && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `translate(-50%, 0) rotate(${-(sticker.rotation || 0)}deg) scale(${1 / (sticker.scale || 1)})`,
            transformOrigin: "center center",
          }}
          className={`absolute left-1/2 flex items-center gap-1 rounded-xl bg-white/95 p-1 shadow-lg border border-zinc-200 z-40 whitespace-nowrap ${
            showToolbarAbove ? "-top-12" : "-bottom-12"
          }`}
        >
          <button
            type="button"
            onClick={handleQuickRotate}
            title="Putar 30°"
            aria-label="Putar stiker 30 derajat"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold tap-bounce cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => handleQuickZoom(e, 0.15)}
            title="Perbesar"
            aria-label="Perbesar stiker"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold tap-bounce cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => handleQuickZoom(e, -0.15)}
            title="Perkecil"
            aria-label="Perkecil stiker"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold tap-bounce cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleQuickDelete}
            title="Hapus"
            aria-label="Hapus stiker"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold tap-bounce cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function CanvasCustomizerScreen({
  layoutType,
  photos,
  sessionSecondsLeft,
  watermarkText,
  initialThemeId = "THEATER_TICKET",
  initialFrameColor = "#FFFFFF",
  onFinishCustomization,
  onRetakePhotos,
  onTimeExpired,
}: CanvasCustomizerScreenProps) {
  const [activeTab, setActiveTab] = useState<"FILTER" | "STICKERS" | "THEME">("FILTER");
  const [selectedTheme, setSelectedTheme] = useState<string>(initialThemeId);
  const [selectedFilter, setSelectedFilter] = useState<string>("NORMAL");
  const [selectedFrameColor, setSelectedFrameColor] = useState<string>(initialFrameColor);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeEmoji, setActiveEmoji] = useState<string>("🎀");

  const [basePreviewImage, setBasePreviewImage] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const [sheetSize, setSheetSize] = useState<{ width: number; height: number }>({ width: 360, height: 540 });

  useEffect(() => {
    if (!viewportRef.current) return;
    const updateSize = (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;
      let w = width;
      let h = w * (3 / 2);
      if (h > height) {
        h = height;
        w = h * (2 / 3);
      }
      setSheetSize({ width: Math.floor(w), height: Math.floor(h) });
    };

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateSize(width, height);
      }
    });

    ro.observe(viewportRef.current);
    const rect = viewportRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const style = window.getComputedStyle(viewportRef.current);
      const padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const padY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
      updateSize(rect.width - padX, rect.height - padY);
    }

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (sessionSecondsLeft <= 0) {
      onTimeExpired();
    }
  }, [sessionSecondsLeft, onTimeExpired]);

  // Render clean composite base (without burned stickers) so stickers can move smoothly at 60fps
  const updateBaseRender = useCallback(async () => {
    setIsRendering(true);
    try {
      const dataUrl = await renderCompositeCanvas({
        layoutType,
        photos,
        filter: selectedFilter,
        frameColor: selectedFrameColor,
        stickers: [], // stickers rendered as interactive DOM elements on top
        themeStyle: selectedTheme,
        watermarkText,
      });
      setBasePreviewImage(dataUrl);
    } catch (err) {
      console.error("Canvas render error:", err);
    } finally {
      setIsRendering(false);
    }
  }, [layoutType, photos, selectedFilter, selectedFrameColor, selectedTheme, watermarkText]);

  useEffect(() => {
    updateBaseRender();
  }, [updateBaseRender]);

  // Selected sticker object reference
  const selectedSticker = stickers.find((s) => s.id === selectedStickerId) || null;

  const handleAddSticker = (emoji: string, defaultX = 50, defaultY = 40) => {
    sounds.playClick();
    const newSticker: StickerItem = {
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      emoji,
      x: defaultX,
      y: defaultY,
      scale: 1,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleUpdateSticker = (id: string, patch: Partial<StickerItem>) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const handleDeleteSticker = (id: string) => {
    sounds.playClick();
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  const handleDuplicateSticker = () => {
    if (!selectedSticker) return;
    sounds.playClick();
    const newSticker: StickerItem = {
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      emoji: selectedSticker.emoji,
      x: Math.min(92, selectedSticker.x + 6),
      y: Math.min(94, selectedSticker.y + 6),
      scale: selectedSticker.scale,
      rotation: selectedSticker.rotation,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleRotateDirect = (deg: number) => {
    if (!selectedStickerId) return;
    handleUpdateSticker(selectedStickerId, { rotation: deg });
  };

  const handleRotateStep = (delta: number) => {
    if (!selectedStickerId || !selectedSticker) return;
    sounds.playClick();
    let next = selectedSticker.rotation + delta;
    if (next > 180) next -= 360;
    if (next < -180) next += 360;
    handleUpdateSticker(selectedStickerId, { rotation: next });
  };

  const handleScaleDirect = (scaleVal: number) => {
    if (!selectedStickerId) return;
    handleUpdateSticker(selectedStickerId, { scale: Math.max(0.5, Math.min(2.4, scaleVal)) });
  };

  const handleScaleStep = (delta: number) => {
    if (!selectedStickerId || !selectedSticker) return;
    sounds.playClick();
    const next = Math.max(0.5, Math.min(2.4, +(selectedSticker.scale + delta).toFixed(2)));
    handleUpdateSticker(selectedStickerId, { scale: next });
  };

  const handleQuickMoveStrip = (targetX: number) => {
    if (!selectedStickerId) return;
    sounds.playClick();
    handleUpdateSticker(selectedStickerId, { x: targetX });
  };

  // If user clicks on empty space on the sheet, move selected sticker there
  const handleSheetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedStickerId || !sheetContainerRef.current) return;
    const rect = sheetContainerRef.current.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    sounds.playClick();
    handleUpdateSticker(selectedStickerId, {
      x: Math.max(5, Math.min(95, clickX)),
      y: Math.max(4, Math.min(96, clickY)),
    });
  };

  const handleFinish = async () => {
    sounds.playSuccess();
    setIsRendering(true);
    try {
      const finalDataUrl = await renderCompositeCanvas({
        layoutType,
        photos,
        filter: selectedFilter,
        frameColor: selectedFrameColor,
        stickers, // Burn all final stickers at 1200x1800 300 DPI
        themeStyle: selectedTheme,
        watermarkText,
      });
      onFinishCustomization(finalDataUrl, stickers, selectedFilter, selectedFrameColor);
    } catch (err) {
      console.error("Error creating final composite canvas:", err);
    } finally {
      setIsRendering(false);
    }
  };

  const mins = Math.floor(sessionSecondsLeft / 60);
  const secs = sessionSecondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col justify-between studio-bg p-4 md:p-5 select-none overflow-hidden font-sans text-zinc-900">
      {/* Top Header Bar */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-zinc-200/80 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onRetakePhotos();
            }}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 tap-bounce text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-700" />
            <span>Foto Ulang (Retake)</span>
          </button>

          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">
              Langkah 2 dari 3 • Touch-Up Akhir
            </span>
            <h2 className="text-base font-bold text-zinc-900">
              Poles Filter Warna dan Dekorasi Stiker
            </h2>
          </div>
        </div>

        {/* Global Session Timer */}
        <div
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 font-mono text-xs font-semibold border transition ${
            sessionSecondsLeft <= 60
              ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
              : "bg-zinc-100 text-zinc-800 border-zinc-200"
          }`}
        >
          <Clock className={`h-3.5 w-3.5 ${sessionSecondsLeft <= 60 ? "text-red-500" : "text-zinc-600"}`} />
          <span>Sisa Waktu: {timeFormatted}</span>
        </div>
      </div>

      {/* Main Touch Interaction Stage */}
      <div className="flex flex-1 min-h-0 items-stretch justify-center gap-6 py-2 overflow-hidden max-w-6xl w-full mx-auto">
        {/* LEFT COLUMN: Physical Paper Printout Preview Stage */}
        <div className="flex flex-1 min-h-0 h-full flex-col rounded-2xl bg-white p-4 border border-zinc-200/80 shadow-xs overflow-hidden">
          {/* Header Bar */}
          <div className="w-full flex-shrink-0 flex items-center justify-between text-xs font-mono text-zinc-600 mb-2 px-1">
            <span className="font-bold text-zinc-800 uppercase">
              Pratinjau Lembar Cetak 4R (2 Strip Kembar)
            </span>
            <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
              {selectedStickerId ? "Geser stiker langsung pada foto" : "Ketuk stiker untuk mengatur"}
            </span>
          </div>

          {/* Canvas Sheet Viewport Container */}
          <div
            ref={viewportRef}
            className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden rounded-xl bg-zinc-100/80 p-2.5 sm:p-3 border border-zinc-200 shadow-inner"
            onClick={() => setSelectedStickerId(null)}
          >
            {/* The 2:3 Composite 4R Paper Sheet Wrapper */}
            <div
              ref={sheetContainerRef}
              style={{
                width: `${sheetSize.width}px`,
                height: `${sheetSize.height}px`,
                touchAction: "none",
              }}
              className="@container relative rounded-xl shadow-lg border border-zinc-300 bg-white select-none overflow-hidden shrink-0 transition-[width,height] duration-75"
              onClick={(e) => {
                e.stopPropagation();
                handleSheetClick(e);
              }}
            >
              {basePreviewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={basePreviewImage}
                  alt="Pratinjau Lembar Foto"
                  className="h-full w-full object-fill pointer-events-none select-none block"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500 font-medium">
                  Menyusun lembar foto...
                </div>
              )}

              {/* OVERLAY INTERACTIVE STICKERS */}
              {stickers.map((st) => (
                <InteractiveSticker
                  key={st.id}
                  sticker={st}
                  isSelected={st.id === selectedStickerId}
                  onSelect={() => setSelectedStickerId(st.id)}
                  onUpdate={(patch) => handleUpdateSticker(st.id, patch)}
                  onDelete={() => handleDeleteSticker(st.id)}
                  containerRef={sheetContainerRef}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Touch Friendly Customizer Panel */}
        <div className="flex h-full min-h-0 w-80 sm:w-96 flex-col justify-between rounded-2xl bg-white p-5 border border-zinc-200/80 shadow-xs">
          <div className="flex flex-1 min-h-0 flex-col">
            {/* Tool Category Tabs */}
            <div className="flex-shrink-0 flex gap-1 rounded-xl bg-zinc-200/80 p-1 border border-zinc-200 mb-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("FILTER");
                }}
                className={`flex-1 flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition focus-visible:outline-none cursor-pointer ${
                  activeTab === "FILTER"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Filter Warna</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("STICKERS");
                }}
                className={`flex-1 flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition focus-visible:outline-none cursor-pointer ${
                  activeTab === "STICKERS"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Smile className="h-3.5 w-3.5" />
                <span>Stiker ({stickers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("THEME");
                }}
                className={`flex-1 flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition focus-visible:outline-none cursor-pointer ${
                  activeTab === "THEME"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                <span>Frame</span>
              </button>
            </div>

            {/* TAB 1: FILTER WARNA (WITH VISUAL SWATCH TILES) */}
            {activeTab === "FILTER" && (
              <div className="flex flex-1 min-h-0 flex-col space-y-2">
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1 flex-shrink-0">
                  Pilih Nada Warna Studio:
                </span>
                <div className="grid grid-cols-1 gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
                  {FILTERS.map((f) => {
                    const isSelected = selectedFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setSelectedFilter(f.id);
                        }}
                        className={`flex min-h-[50px] items-center justify-between rounded-xl p-3 border transition tap-bounce cursor-pointer ${
                          isSelected
                            ? "bg-white text-zinc-900 border-[#1d1d1f] shadow-xs ring-2 ring-zinc-900"
                            : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-7 w-7 rounded-lg bg-gradient-to-br ${f.previewGradient} border border-black/10 shadow-2xs shrink-0`}
                          />
                          <div className="text-left">
                            <span className="text-xs font-bold block">{f.name}</span>
                            <span
                              className={`text-[10px] font-normal block ${
                                isSelected ? "text-zinc-800" : "text-zinc-500"
                              }`}
                            >
                              {f.tag}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d1d1f] text-white shadow-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: STICKERS (SMOOTH DRAG, ZOOM SLIDER, ROTATION SLIDER & CONTROLS) */}
            {activeTab === "STICKERS" && (
              <div className="flex flex-1 min-h-0 flex-col space-y-3 overflow-y-auto pr-1">
                {/* Active Sticker Customization Controls */}
                {selectedSticker ? (
                  <div className="space-y-3">
                    {/* Selected Sticker Header Bar */}
                    <div className="flex items-center justify-between bg-zinc-100/90 px-3 py-2 rounded-xl border border-zinc-200">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedSticker.emoji}</span>
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block leading-tight">
                            Stiker Terpilih
                          </span>
                          <span className="text-[10px] text-zinc-600 font-medium">
                            Seret stiker pada foto untuk geser
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStickerId(null)}
                        className="text-[11px] font-semibold text-zinc-700 hover:text-zinc-900 bg-white px-2.5 py-1 rounded-lg border border-zinc-200 tap-bounce shadow-2xs cursor-pointer"
                      >
                        Selesai
                      </button>
                    </div>

                    {/* 1. Zoom / Scale Slider & Presets */}
                    <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                        <span className="flex items-center gap-1.5">
                          <Maximize2 className="h-3.5 w-3.5 text-zinc-700" />
                          <span>Ukuran Stiker (Zoom)</span>
                        </span>
                        <span className="font-mono text-zinc-700 font-semibold bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                          {Math.round(selectedSticker.scale * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleScaleStep(-0.1)}
                          aria-label="Perkecil stiker"
                          className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-100 tap-bounce shadow-2xs cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <input
                          type="range"
                          min="0.5"
                          max="2.4"
                          step="0.05"
                          value={selectedSticker.scale}
                          onChange={(e) => handleScaleDirect(parseFloat(e.target.value))}
                          aria-label="Geser ukuran stiker"
                          className="flex-1 h-2 rounded-lg bg-zinc-200 accent-[#1d1d1f] cursor-pointer"
                        />

                        <button
                          type="button"
                          onClick={() => handleScaleStep(0.1)}
                          aria-label="Perbesar stiker"
                          className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-100 tap-bounce shadow-2xs cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1 pt-0.5">
                        {[
                          { label: "Kecil", val: 0.75 },
                          { label: "Sedang", val: 1.0 },
                          { label: "Besar", val: 1.4 },
                          { label: "Ekstra", val: 1.9 },
                        ].map((pr) => (
                          <button
                            key={pr.label}
                            type="button"
                            onClick={() => handleScaleDirect(pr.val)}
                            className={`py-1 rounded-lg text-[10px] font-semibold border transition tap-bounce cursor-pointer ${
                              Math.abs(selectedSticker.scale - pr.val) < 0.08
                                ? "bg-[#1d1d1f] text-white border-zinc-900 shadow-2xs"
                                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                            }`}
                          >
                            {pr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Rotation Slider & Presets */}
                    <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                        <span className="flex items-center gap-1.5">
                          <RotateCw className="h-3.5 w-3.5 text-zinc-700" />
                          <span>Putar Stiker (Rotasi)</span>
                        </span>
                        <span className="font-mono text-zinc-700 font-semibold bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                          {selectedSticker.rotation}°
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRotateStep(-15)}
                          aria-label="Putar kiri 15 derajat"
                          className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-100 tap-bounce shadow-2xs cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>

                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="5"
                          value={selectedSticker.rotation}
                          onChange={(e) => handleRotateDirect(parseInt(e.target.value, 10))}
                          aria-label="Geser sudut putaran stiker"
                          className="flex-1 h-2 rounded-lg bg-zinc-200 accent-[#1d1d1f] cursor-pointer"
                        />

                        <button
                          type="button"
                          onClick={() => handleRotateStep(15)}
                          aria-label="Putar kanan 15 derajat"
                          className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-100 tap-bounce shadow-2xs cursor-pointer"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1 pt-0.5">
                        {[
                          { label: "-45°", val: -45 },
                          { label: "0° Tegak", val: 0 },
                          { label: "+45°", val: 45 },
                          { label: "+90°", val: 90 },
                        ].map((pr) => (
                          <button
                            key={pr.label}
                            type="button"
                            onClick={() => handleRotateDirect(pr.val)}
                            className={`py-1 rounded-lg text-[10px] font-semibold border transition tap-bounce cursor-pointer ${
                              selectedSticker.rotation === pr.val
                                ? "bg-[#1d1d1f] text-white border-zinc-900 shadow-2xs"
                                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                            }`}
                          >
                            {pr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Action Buttons (Position Shortcut, Duplicate, Delete) */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickMoveStrip(25)}
                        className="flex-1 flex min-h-[40px] items-center justify-center gap-1 rounded-xl bg-white border border-zinc-200 text-[11px] font-semibold text-zinc-800 hover:bg-zinc-50 tap-bounce shadow-2xs cursor-pointer"
                      >
                        <span>Ke Strip 1 (Kiri)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickMoveStrip(75)}
                        className="flex-1 flex min-h-[40px] items-center justify-center gap-1 rounded-xl bg-white border border-zinc-200 text-[11px] font-semibold text-zinc-800 hover:bg-zinc-50 tap-bounce shadow-2xs cursor-pointer"
                      >
                        <span>Ke Strip 2 (Kanan)</span>
                      </button>
                    </div>

                    <div className="flex gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={handleDuplicateSticker}
                        className="flex-1 flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-semibold text-zinc-900 tap-bounce cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5 text-zinc-700" />
                        <span>Duplikat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSticker(selectedSticker.id)}
                        className="flex min-h-[44px] px-4 items-center justify-center gap-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 tap-bounce cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    {/* Mini Collapsed Sticker Picker to Add More */}
                    <div className="pt-2 border-t border-zinc-200">
                      <span className="text-[11px] font-semibold text-zinc-700 mb-1.5 block">
                        Tambah Stiker Lain:
                      </span>
                      <div className="grid grid-cols-6 gap-1 p-1 bg-zinc-50 rounded-xl border border-zinc-200 max-h-[14vh] overflow-y-auto">
                        {STICKER_LIST.map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setActiveEmoji(emoji);
                              handleAddSticker(emoji, 50, 40);
                            }}
                            className="flex min-h-[38px] items-center justify-center rounded-lg bg-white border border-zinc-200 text-xl hover:bg-zinc-100 tap-bounce shadow-2xs cursor-pointer"
                            aria-label={`Tambah stiker ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* When no sticker is selected: Show full grid & quick actions */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                        Pilih Stiker Dekorasi:
                      </span>
                      <span className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                        Ketuk untuk menempel
                      </span>
                    </div>

                    {/* Sticker Grid */}
                    <div className="grid grid-cols-4 gap-2 max-h-[28vh] overflow-y-auto p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                      {STICKER_LIST.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveEmoji(emoji);
                            handleAddSticker(emoji, 50, 40);
                          }}
                          className={`flex min-h-[48px] items-center justify-center rounded-xl bg-white border text-2xl hover:bg-zinc-100 tap-bounce shadow-2xs transition focus-visible:outline-none cursor-pointer ${
                            activeEmoji === emoji ? "border-[#1d1d1f] ring-2 ring-zinc-900" : "border-zinc-200"
                          }`}
                          aria-label={`Pilih stiker ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Quick Strip-Placement Shortcuts */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddSticker(activeEmoji, 25, 40)}
                        className="flex-1 flex min-h-[40px] items-center justify-center gap-1 text-[11px] font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl border border-zinc-200 transition tap-bounce cursor-pointer"
                      >
                        <span>Pasang di Strip 1 (Kiri)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSticker(activeEmoji, 75, 40)}
                        className="flex-1 flex min-h-[40px] items-center justify-center gap-1 text-[11px] font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl border border-zinc-200 transition tap-bounce cursor-pointer"
                      >
                        <span>Pasang di Strip 2 (Kanan)</span>
                      </button>
                    </div>

                    {/* List of active stickers chips if any exist */}
                    {stickers.length > 0 && (
                      <div className="rounded-xl bg-zinc-50 p-2.5 border border-zinc-200 space-y-1.5">
                        <span className="text-[11px] font-semibold text-zinc-700 block">
                          Stiker Terpasang di Foto ({stickers.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {stickers.map((st, i) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setSelectedStickerId(st.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 tap-bounce shadow-2xs cursor-pointer"
                            >
                              <span>{st.emoji}</span>
                              <span className="text-[10px] text-zinc-500">#{i + 1}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: THEME QUICK SWITCH */}
            {activeTab === "THEME" && (
              <div className="flex flex-1 min-h-0 flex-col space-y-2 overflow-y-auto pr-1">
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">
                  Ubah Desain Frame Instan:
                </span>
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedTheme(t.id);
                    }}
                    className={`flex flex-col w-full text-left p-2.5 rounded-xl border transition min-h-[50px] tap-bounce cursor-pointer ${
                      selectedTheme === t.id
                        ? "border-[#1d1d1f] bg-white ring-2 ring-zinc-900 shadow-xs"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <span className="text-xs font-bold text-zinc-900">{t.name}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5 font-normal">{t.desc}</span>
                  </button>
                ))}

                {/* Color swatches for CLASSIC theme */}
                {selectedTheme === "CLASSIC" && (
                  <div className="pt-2 border-t border-zinc-200 mt-2">
                    <span className="text-[11px] font-semibold text-zinc-700 mb-2 block">
                      Pilihan Warna Solid Frame:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {FRAME_COLORS.map((fc) => (
                        <button
                          key={fc.hex}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedFrameColor(fc.hex);
                          }}
                          className={`flex items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold min-h-[44px] min-w-[44px] tap-bounce cursor-pointer ${
                            selectedFrameColor === fc.hex
                              ? "border-[#1d1d1f] bg-white ring-1 ring-zinc-900"
                              : "border-zinc-200 bg-white hover:bg-zinc-50"
                          }`}
                        >
                          <div
                            className="h-3.5 w-3.5 rounded-full border border-zinc-300 shrink-0"
                            style={{ backgroundColor: fc.hex }}
                          />
                          <span className="truncate">{fc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FINISH & PRINT CTA BUTTON */}
          <div className="pt-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleFinish}
              disabled={isRendering}
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white shadow-xs tap-bounce disabled:opacity-50 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Selesai & Lanjut Cetak Otomatis</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-center text-[10px] text-zinc-500 block mt-1 font-normal">
              Foto akan langsung dicetak otomatis tanpa perlu tekan tombol manual
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
