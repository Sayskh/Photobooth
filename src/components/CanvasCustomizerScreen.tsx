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
  Move,
  Layers,
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

  const [previewImage, setPreviewImage] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(false);

  useEffect(() => {
    if (sessionSecondsLeft <= 0) {
      onTimeExpired();
    }
  }, [sessionSecondsLeft, onTimeExpired]);

  const updateRender = useCallback(async () => {
    setIsRendering(true);
    try {
      const dataUrl = await renderCompositeCanvas({
        layoutType,
        photos,
        filter: selectedFilter,
        frameColor: selectedFrameColor,
        stickers,
        themeStyle: selectedTheme,
        watermarkText,
      });
      setPreviewImage(dataUrl);
    } catch (err) {
      console.error("Canvas render error:", err);
    } finally {
      setIsRendering(false);
    }
  }, [layoutType, photos, selectedFilter, selectedFrameColor, stickers, selectedTheme, watermarkText]);

  useEffect(() => {
    updateRender();
  }, [updateRender]);

  const handleAddSticker = (emoji: string, defaultX = 50, defaultY = 50) => {
    sounds.playClick();
    const newSticker: StickerItem = {
      id: `st-${Date.now()}-${Math.random()}`,
      emoji,
      x: defaultX,
      y: defaultY,
      scale: 1,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleRotateSticker = () => {
    if (!selectedStickerId) return;
    sounds.playClick();
    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedStickerId ? { ...s, rotation: (s.rotation + 20) % 360 } : s
      )
    );
  };

  const handleScaleSticker = (delta: number) => {
    if (!selectedStickerId) return;
    sounds.playClick();
    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedStickerId
          ? { ...s, scale: Math.max(0.6, Math.min(2.4, +(s.scale + delta).toFixed(1))) }
          : s
      )
    );
  };

  const handleDeleteSticker = () => {
    if (!selectedStickerId) return;
    sounds.playClick();
    setStickers((prev) => prev.filter((s) => s.id !== selectedStickerId));
    setSelectedStickerId(null);
  };

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const handlePreviewTouch = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedStickerId || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedStickerId
          ? { ...s, x: Math.max(5, Math.min(95, xPct)), y: Math.max(5, Math.min(95, yPct)) }
          : s
      )
    );
  };

  const handleFinish = async () => {
    sounds.playSuccess();
    const finalDataUrl = await renderCompositeCanvas({
      layoutType,
      photos,
      filter: selectedFilter,
      frameColor: selectedFrameColor,
      stickers,
      themeStyle: selectedTheme,
      watermarkText,
    });
    onFinishCustomization(finalDataUrl, stickers, selectedFilter, selectedFrameColor);
  };

  const mins = Math.floor(sessionSecondsLeft / 60);
  const secs = sessionSecondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="relative flex h-screen w-screen flex-col justify-between studio-bg p-4 md:p-5 select-none overflow-hidden font-sans text-zinc-900">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
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
      <div className="flex flex-1 items-center justify-center gap-6 py-2 overflow-hidden max-w-6xl w-full mx-auto">
        {/* LEFT COLUMN: Physical Paper Printout Preview Stage */}
        <div className="flex flex-1 h-full max-h-[76vh] flex-col items-center justify-center rounded-2xl bg-white p-4 border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-600 mb-2 px-2">
            <span className="font-bold text-zinc-800 uppercase">
              Pratinjau Lembar Cetak 4R Vertikal (2 Strip Fisik)
            </span>
            {selectedStickerId && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                Mode Geser: Sentuh area foto untuk memindahkan stiker
              </span>
            )}
          </div>

          <div
            ref={previewContainerRef}
            onClick={handlePreviewTouch}
            className="relative flex flex-1 items-center justify-center w-full overflow-hidden cursor-crosshair rounded-xl bg-zinc-100 p-2 border border-zinc-200 shadow-inner"
          >
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage}
                alt="Pratinjau Foto Siap Cetak"
                className="max-h-full max-w-full rounded-lg object-contain shadow-md border border-zinc-300"
              />
            ) : (
              <div className="flex items-center gap-2 text-zinc-600 font-semibold text-xs">
                <span>Menyusun foto...</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Touch Friendly Customizer Panel */}
        <div className="flex h-full max-h-[76vh] w-96 flex-col justify-between rounded-2xl bg-white p-5 border border-zinc-200/80 shadow-xs">
          <div>
            {/* Tool Category Tabs */}
            <div className="flex gap-1 rounded-xl bg-zinc-200/80 p-1 border border-zinc-200 mb-3">
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
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">
                  Pilih Nada Warna Studio:
                </span>
                <div className="grid grid-cols-1 gap-2 max-h-[46vh] overflow-y-auto pr-1">
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

            {/* TAB 2: STICKERS (WITH STRIP QUICK-PLACEMENT & TACTILE CONTROLS) */}
            {activeTab === "STICKERS" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Pilih Stiker Dekorasi:
                  </span>
                  <div className="flex gap-1.5 text-[10px] font-medium text-zinc-600">
                    <span className="bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                      Ketuk stiker untuk pasang
                    </span>
                  </div>
                </div>

                {/* Sticker Grid */}
                <div className="grid grid-cols-4 gap-2 max-h-[28vh] overflow-y-auto p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                  {STICKER_LIST.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveEmoji(emoji);
                        handleAddSticker(emoji, 50, 45);
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

                {/* Active Sticker Manipulator Bar */}
                {selectedStickerId && (
                  <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-zinc-900 flex items-center gap-1">
                        <Move className="h-3 w-3 text-zinc-600" />
                        <span>Atur Ukuran & Rotasi:</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        Sentuh foto untuk geser
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={handleRotateSticker}
                        aria-label="Putar stiker"
                        className="flex min-h-[42px] flex-1 items-center justify-center gap-1 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 tap-bounce shadow-2xs cursor-pointer"
                      >
                        <RotateCw className="h-3.5 w-3.5 text-zinc-700" />
                        <span>Putar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleScaleSticker(0.2)}
                        aria-label="Perbesar stiker"
                        className="flex min-h-[42px] flex-1 items-center justify-center gap-1 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 tap-bounce shadow-2xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 text-zinc-700" />
                        <span>Besar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleScaleSticker(-0.2)}
                        aria-label="Perkecil stiker"
                        className="flex min-h-[42px] flex-1 items-center justify-center gap-1 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 tap-bounce shadow-2xs cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5 text-zinc-700" />
                        <span>Kecil</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteSticker}
                        aria-label="Hapus stiker"
                        className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 tap-bounce shadow-2xs cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: THEME QUICK SWITCH */}
            {activeTab === "THEME" && (
              <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
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
                          className={`flex items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold min-h-[40px] tap-bounce cursor-pointer ${
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
          <div className="pt-2">
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
