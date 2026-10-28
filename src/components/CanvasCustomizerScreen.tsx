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
  { id: "THEATER_TICKET", name: "Archive Ticket", desc: "Vintage tiket bioskop & barcode" },
  { id: "CLASSIC", name: "Studio Minimal", desc: "Frame border bersih warna solid" },
  { id: "Y2K_CHECKER", name: "Y2K Street", desc: "Motif catur, starburst & retro eyes" },
  { id: "GREEN_CAFE", name: "Seoul Cafe", desc: "Vintage diner receipt & badges" },
  { id: "POP_YELLOW", name: "Rad Pop Yellow", desc: "High-contrast bold doodle pop" },
];

const FRAME_COLORS = [
  { name: "Putih", hex: "#FFFFFF" },
  { name: "Hitam", hex: "#18181B" },
  { name: "Krem", hex: "#FEF3C7" },
  { name: "Soft Pink", hex: "#FCE7F3" },
  { name: "Lavender", hex: "#EDE9FE" },
  { name: "Sage Mint", hex: "#D1FAE5" },
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
    <div className="relative flex h-screen w-screen flex-col justify-between bg-zinc-100 p-5 select-none overflow-hidden font-sans text-zinc-900">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200/90 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onRetakePhotos();
            }}
            className="flex min-h-[46px] items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 active:scale-95 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
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
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold border transition ${
            sessionSecondsLeft <= 60
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-white text-zinc-800 border-zinc-200 shadow-2xs"
          }`}
        >
          <Clock className={`h-3.5 w-3.5 ${sessionSecondsLeft <= 60 ? "text-red-600" : "text-zinc-600"}`} />
          <span>Sisa Waktu: {timeFormatted}</span>
        </div>
      </div>

      {/* Main Touch Interaction Stage */}
      <div className="flex flex-1 items-center justify-center gap-6 py-2 overflow-hidden max-w-6xl w-full mx-auto">
        {/* LEFT COLUMN: Physical Paper Printout Preview Stage */}
        <div className="flex flex-1 h-full max-h-[76vh] flex-col items-center justify-center rounded-2xl bg-zinc-200/60 p-4 border border-zinc-300/80 shadow-inner overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-600 mb-2 px-2">
            <span className="font-bold text-zinc-800 uppercase">
              Pratinjau Lembar Cetak 4R (2 Strip Fisik)
            </span>
            {selectedStickerId && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Mode Geser: Sentuh area foto untuk memindahkan stiker
              </span>
            )}
          </div>

          <div
            ref={previewContainerRef}
            onClick={handlePreviewTouch}
            className="relative flex flex-1 items-center justify-center w-full overflow-hidden cursor-crosshair rounded-xl bg-white/70 p-2 border border-zinc-200 shadow-sm"
          >
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage}
                alt="Pratinjau Foto Siap Cetak"
                className="max-h-full max-w-full rounded-md object-contain shadow-xl border border-zinc-300"
              />
            ) : (
              <div className="flex items-center gap-2 text-zinc-600 font-medium text-xs">
                <span>Menyusun foto...</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Touch Friendly Customizer Panel */}
        <div className="flex h-full max-h-[76vh] w-96 flex-col justify-between rounded-2xl bg-white p-5 border border-zinc-200/90 shadow-sm">
          <div>
            {/* Tool Category Tabs */}
            <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 border border-zinc-200 mb-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("FILTER");
                }}
                className={`flex-1 flex min-h-[46px] items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition focus-visible:outline-none cursor-pointer ${
                  activeTab === "FILTER"
                    ? "bg-white text-zinc-900 shadow-2xs"
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
                className={`flex-1 flex min-h-[46px] items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition focus-visible:outline-none cursor-pointer ${
                  activeTab === "STICKERS"
                    ? "bg-white text-zinc-900 shadow-2xs"
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
                className={`flex-1 flex min-h-[46px] items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition focus-visible:outline-none cursor-pointer ${
                  activeTab === "THEME"
                    ? "bg-white text-zinc-900 shadow-2xs"
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
                        className={`flex min-h-[52px] items-center justify-between rounded-xl p-3 border transition active:scale-95 cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-sm ring-2 ring-zinc-900"
                            : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-7 w-7 rounded-lg bg-gradient-to-br ${f.previewGradient} border shadow-2xs shrink-0`}
                          />
                          <div className="text-left">
                            <span className="text-xs font-bold block">{f.name}</span>
                            <span
                              className={`text-[10px] block ${
                                isSelected ? "text-zinc-300" : "text-zinc-500"
                              }`}
                            >
                              {f.tag}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-zinc-900">
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
                  <div className="flex gap-1.5 text-[10px] font-bold text-zinc-600">
                    <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
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
                      className={`flex min-h-[48px] items-center justify-center rounded-xl bg-white border text-2xl hover:bg-zinc-100 active:scale-90 shadow-2xs transition focus-visible:outline-none cursor-pointer ${
                        activeEmoji === emoji ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200"
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
                    onClick={() => handleAddSticker(activeEmoji, 40, 25)}
                    className="flex-1 flex min-h-[40px] items-center justify-center gap-1 text-[11px] font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg border border-zinc-200 transition active:scale-95 cursor-pointer"
                  >
                    <span>Pasang di Strip 1 (Atas)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSticker(activeEmoji, 40, 75)}
                    className="flex-1 flex min-h-[40px] items-center justify-center gap-1 text-[11px] font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg border border-zinc-200 transition active:scale-95 cursor-pointer"
                  >
                    <span>Pasang di Strip 2 (Bawah)</span>
                  </button>
                </div>

                {/* Active Sticker Manipulator Bar */}
                {selectedStickerId && (
                  <div className="rounded-xl bg-zinc-100 p-2.5 border border-zinc-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-zinc-800 flex items-center gap-1">
                        <Move className="h-3 w-3 text-zinc-600" />
                        <span>Atur Ukuran & Rotasi:</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        Sentuh foto untuk geser
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={handleRotateSticker}
                        aria-label="Putar stiker"
                        className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-lg bg-white border border-zinc-300 text-xs font-bold text-zinc-800 hover:bg-zinc-50 active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        <span>Putar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleScaleSticker(0.2)}
                        aria-label="Perbesar stiker"
                        className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-lg bg-white border border-zinc-300 text-xs font-bold text-zinc-800 hover:bg-zinc-50 active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Besar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleScaleSticker(-0.2)}
                        aria-label="Perkecil stiker"
                        className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-lg bg-white border border-zinc-300 text-xs font-bold text-zinc-800 hover:bg-zinc-50 active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                        <span>Kecil</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteSticker}
                        aria-label="Hapus stiker"
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:scale-95 shadow-2xs cursor-pointer"
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
                    className={`flex flex-col w-full text-left p-2.5 rounded-xl border transition min-h-[50px] cursor-pointer ${
                      selectedTheme === t.id
                        ? "border-zinc-900 bg-zinc-50 shadow-2xs ring-2 ring-zinc-900"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <span className="text-xs font-bold text-zinc-900">{t.name}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">{t.desc}</span>
                  </button>
                ))}

                {/* Color swatches for CLASSIC theme */}
                {selectedTheme === "CLASSIC" && (
                  <div className="pt-2 border-t border-zinc-200 mt-2">
                    <span className="text-[11px] font-bold text-zinc-700 mb-2 block">
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
                          className={`flex items-center gap-1.5 p-2 rounded-lg border text-[11px] font-semibold min-h-[42px] cursor-pointer ${
                            selectedFrameColor === fc.hex
                              ? "border-zinc-900 bg-zinc-100 ring-1 ring-zinc-900"
                              : "border-zinc-200 bg-white"
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
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Selesai & Lanjut Cetak Otomatis</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-center text-[10px] text-zinc-500 block mt-1 font-medium">
              Foto akan langsung dicetak otomatis tanpa perlu tekan tombol manual
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
