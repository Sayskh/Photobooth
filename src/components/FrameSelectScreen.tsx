"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, ChevronRight, Layers, Palette } from "lucide-react";
import { sounds } from "@/lib/sound";

export interface TemplateChoice {
  id: string;
  name: string;
  shortName: string;
  layoutType: "STRIP_2X6" | "GRID_4X6" | "POLAROID";
  slotsCount: number;
  posesPerStrip: number;
  printCopies: number;
  badge: string;
  headline: string;
  subHeadline: string;
}

export interface FrameThemeChoice {
  id: string;
  name: string;
  tagline: string;
  bgHex: string;
  textColor: string;
  borderHex: string;
}

export const THEME_OPTIONS: FrameThemeChoice[] = [
  {
    id: "THEATER_TICKET",
    name: "Archive Ticket",
    tagline: "Vintage ticket & barcode",
    bgHex: "#FDF8F0",
    textColor: "#881337",
    borderHex: "#881337",
  },
  {
    id: "CLASSIC",
    name: "Studio Minimal",
    tagline: "Monochrome border bersih",
    bgHex: "#FFFFFF",
    textColor: "#18181B",
    borderHex: "#E4E4E7",
  },
  {
    id: "Y2K_CHECKER",
    name: "Y2K Street",
    tagline: "Checkerboard & starburst",
    bgHex: "#1E3A8A",
    textColor: "#FFFFFF",
    borderHex: "#1E3A8A",
  },
  {
    id: "GREEN_CAFE",
    name: "Seoul Cafe",
    tagline: "Retro diner guest check",
    bgHex: "#15803D",
    textColor: "#FFFFFF",
    borderHex: "#15803D",
  },
  {
    id: "POP_YELLOW",
    name: "Rad Yellow",
    tagline: "High-contrast bold pop",
    bgHex: "#FACC15",
    textColor: "#18181B",
    borderHex: "#18181B",
  },
];

export const SOLID_PALETTE = [
  { name: "Putih", hex: "#FFFFFF" },
  { name: "Hitam", hex: "#18181B" },
  { name: "Krem", hex: "#FEF3C7" },
  { name: "Soft Pink", hex: "#FCE7F3" },
  { name: "Lavender", hex: "#EDE9FE" },
  { name: "Sage Mint", hex: "#D1FAE5" },
];

export const TEMPLATES: TemplateChoice[] = [
  {
    id: "template-strip-3",
    name: "Twin Film Strip (4R Landscape)",
    shortName: "2 Strip Film (Landscape)",
    layoutType: "STRIP_2X6",
    slotsCount: 6, // 3 poses for Strip 1 + 3 poses for Strip 2
    posesPerStrip: 3,
    printCopies: 2,
    badge: "Favorit • 2 Strip 6×2\"",
    headline: "6 Pose Landscape (3 Pose Berbeda Tiap Strip)",
    subHeadline: "Lembar 4R Landscape terbelah jadi 2 strip film sinematik dengan pose berbeda",
  },
  {
    id: "template-grid-4",
    name: "Modern Card (4R Postcard)",
    shortName: "Postcard 4R",
    layoutType: "GRID_4X6",
    slotsCount: 4,
    posesPerStrip: 4,
    printCopies: 1,
    badge: "1 Kartu Lebar",
    headline: "4 Pose Lebar (Grid 2×2 Landscape)",
    subHeadline: "1 lembar kartu pos tebal 15×10 cm, foto lebar tanpa terpotong",
  },
  {
    id: "template-duo-2",
    name: "Twin Polaroid (Landscape)",
    shortName: "2 Polaroid Kembar",
    layoutType: "POLAROID",
    slotsCount: 4, // 2 poses for Card 1 + 2 poses for Card 2
    posesPerStrip: 2,
    printCopies: 2,
    badge: "2 Lembar Kartu",
    headline: "4 Pose Sinematik (2 Pose Tiap Kartu)",
    subHeadline: "2 kartu foto lebar dengan margin bawah luas untuk dekorasi stiker",
  },
];

interface FrameSelectScreenProps {
  onBack: () => void;
  onSelectTemplate: (template: TemplateChoice, themeId: string, frameColor: string) => void;
  initialTemplateId?: string;
  initialThemeId?: string;
  initialFrameColor?: string;
}

// Clean editorial landscape silhouette card (Zero emoji, Zero AI-slop)
function EditorialLandscapeCard({
  poseNum,
  label,
}: {
  poseNum: number;
  label: string;
}) {
  return (
    <div className="relative flex flex-1 h-full flex-col items-center justify-between overflow-hidden rounded-[3px] p-1 bg-zinc-200/90 text-zinc-800 border border-black/5 select-none">
      <div className="flex w-full items-center justify-between opacity-50 text-[6px] font-mono tracking-wider">
        <span>P{poseNum}</span>
        <span>4:3</span>
      </div>

      <svg
        viewBox="0 0 64 64"
        fill="currentColor"
        className="h-6 w-6 opacity-25 my-auto"
        aria-hidden="true"
      >
        <circle cx="32" cy="22" r="14" />
        <path d="M12 56c0-11 9-20 20-20s20 9 20 20H12z" />
      </svg>

      <span className="text-[7px] font-semibold tracking-tight text-center opacity-80 truncate w-full">
        {label}
      </span>
    </div>
  );
}

export function FrameSelectScreen({
  onBack,
  onSelectTemplate,
  initialTemplateId = "template-strip-3",
  initialThemeId = "THEATER_TICKET",
  initialFrameColor = "#FFFFFF",
}: FrameSelectScreenProps) {
  const [selectedFormatId, setSelectedFormatId] = useState<string>(initialTemplateId);
  const [themeMode, setThemeMode] = useState<"THEMES" | "SOLID">("THEMES");
  const [selectedThemeId, setSelectedThemeId] = useState<string>(initialThemeId);
  const [selectedColor, setSelectedColor] = useState<string>(initialFrameColor);

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedFormatId) || TEMPLATES[0];
  const currentTheme = THEME_OPTIONS.find((t) => t.id === selectedThemeId) || THEME_OPTIONS[0];

  const handleSelectFormat = (tmpl: TemplateChoice) => {
    sounds.playClick();
    setSelectedFormatId(tmpl.id);
  };

  const handleSelectTheme = (themeId: string) => {
    sounds.playClick();
    setSelectedThemeId(themeId);
    setThemeMode("THEMES");
  };

  const handleSelectColor = (hex: string) => {
    sounds.playClick();
    setSelectedColor(hex);
    setSelectedThemeId("CLASSIC");
    setThemeMode("SOLID");
  };

  const handleConfirm = () => {
    sounds.playSuccess();
    onSelectTemplate(currentTemplate, selectedThemeId, selectedColor);
  };

  const getThemeBackgroundHex = () => {
    if (selectedThemeId === "CLASSIC") return selectedColor;
    return currentTheme.bgHex;
  };

  const getThemeTextColor = () => {
    if (selectedThemeId === "CLASSIC") {
      const isDark = selectedColor === "#18181B";
      return isDark ? "#FFFFFF" : "#18181B";
    }
    return currentTheme.textColor;
  };

  return (
    <div className="relative flex h-screen w-screen flex-col justify-between bg-zinc-100 p-5 md:p-6 select-none font-sans overflow-hidden text-zinc-900">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/90 pb-3">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 border border-zinc-200 shadow-2xs transition active:scale-95 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">
            Langkah 1 dari 3 • Konfigurasi Cetak
          </span>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 mt-0.5">
            Pilih Format Kertas Landscape & Desain Frame
          </h2>
        </div>

        <div className="w-32 text-right font-mono text-xs font-semibold text-zinc-600">
          Format: 4R Landscape
        </div>
      </div>

      {/* Main Touch Interaction Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto max-w-6xl w-full mx-auto items-center flex-1 py-2 overflow-hidden">
        {/* LEFT COLUMN: Physical Paper Sheet Live Mockup (3:2 Landscape) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-200/60 border border-zinc-300/80 shadow-inner h-full max-h-[500px]">
          <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-600 mb-2 px-1">
            <span className="font-bold uppercase tracking-wider text-zinc-800">
              {currentTemplate.name}
            </span>
            <span className="font-semibold">{currentTemplate.slotsCount} Total Pose</span>
          </div>

          {/* PHYSICAL SHEET MOCKUP CONTAINER (3:2 LANDSCAPE 4R) */}
          <div className="relative flex items-center justify-center w-full flex-1 max-h-[360px]">
            {/* 1. TWIN FILM STRIP (2 HORIZONTAL STRIPS ON 4R LANDSCAPE) */}
            {currentTemplate.layoutType === "STRIP_2X6" && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[260px] w-[385px] flex-col justify-between rounded-lg p-2.5 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                {/* STRIP 1 (TOP) */}
                <div className="flex h-[112px] w-full items-center justify-between gap-1.5">
                  <div className="flex flex-1 items-center gap-1.5 h-full">
                    <EditorialLandscapeCard poseNum={1} label="Pose Utama" />
                    <EditorialLandscapeCard poseNum={2} label="Pose Senyum" />
                    <EditorialLandscapeCard poseNum={3} label="Pose Bebas" />
                  </div>
                  {/* Right Studio Branding Block */}
                  <div className="flex h-full w-[76px] flex-col items-center justify-between rounded bg-black/5 p-1 border border-black/10 text-center">
                    <span className="text-[6px] font-mono font-bold uppercase tracking-wider block opacity-75">
                      STRIP 1
                    </span>
                    <span className="text-[8px] font-bold block leading-tight">
                      KIOSKSNAP
                    </span>
                    <span className="text-[6px] font-mono opacity-60 block">
                      300 DPI
                    </span>
                  </div>
                </div>

                {/* Perforation Guideline (Horizontal) */}
                <div className="relative flex w-full items-center justify-center py-1">
                  <div className="w-full border-b border-dashed border-zinc-400 opacity-60" />
                  <span className="absolute text-[7px] font-mono text-zinc-500 bg-white/80 px-1.5 py-0.5 rounded border border-zinc-200 shadow-2xs">
                    ✄ POTONG DI SINI
                  </span>
                </div>

                {/* STRIP 2 (BOTTOM - DIFFERENT POSES!) */}
                <div className="flex h-[112px] w-full items-center justify-between gap-1.5">
                  <div className="flex flex-1 items-center gap-1.5 h-full">
                    <EditorialLandscapeCard poseNum={4} label="Pose Candid" />
                    <EditorialLandscapeCard poseNum={5} label="Pose Lucu" />
                    <EditorialLandscapeCard poseNum={6} label="Pose Penutup" />
                  </div>
                  {/* Right Studio Branding Block */}
                  <div className="flex h-full w-[76px] flex-col items-center justify-between rounded bg-black/5 p-1 border border-black/10 text-center">
                    <span className="text-[6px] font-mono font-bold uppercase tracking-wider block opacity-75">
                      STRIP 2
                    </span>
                    <span className="text-[8px] font-bold block leading-tight">
                      KIOSKSNAP
                    </span>
                    <span className="text-[6px] font-mono opacity-60 block">
                      300 DPI
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MODERN CARD 4X6 (2x2 GRID LANDSCAPE) */}
            {currentTemplate.layoutType === "GRID_4X6" && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[260px] w-[385px] flex-col justify-between rounded-xl p-3 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <EditorialLandscapeCard poseNum={1} label="Pose 1" />
                  <EditorialLandscapeCard poseNum={2} label="Pose 2" />
                  <EditorialLandscapeCard poseNum={3} label="Pose 3" />
                  <EditorialLandscapeCard poseNum={4} label="Pose 4" />
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-black/10 text-[8px] font-mono opacity-80">
                  <span>POSTCARD LANDSCAPE • 4R</span>
                  <span>KIOSKSNAP STUDIO</span>
                </div>
              </div>
            )}

            {/* 3. TWIN POLAROID (SIDE-BY-SIDE ON 4R LANDSCAPE) */}
            {currentTemplate.layoutType === "POLAROID" && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[260px] w-[385px] justify-between rounded-xl p-2.5 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                {/* POLAROID 1 */}
                <div className="flex h-full w-[180px] flex-col justify-between">
                  <div className="text-center pb-0.5">
                    <span className="text-[7px] font-mono tracking-widest uppercase opacity-75 font-bold block">
                      KARTU 1 • POSE 1-2
                    </span>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <EditorialLandscapeCard poseNum={1} label="Pose 1" />
                    <EditorialLandscapeCard poseNum={2} label="Pose 2" />
                  </div>
                  <div className="mt-1 rounded bg-black/5 p-1 text-center border border-dashed border-black/10">
                    <span className="text-[8px] font-serif italic block">Sweet Memories</span>
                  </div>
                </div>

                <div className="h-full w-[1px] border-r border-dashed border-zinc-400 opacity-60" />

                {/* POLAROID 2 */}
                <div className="flex h-full w-[180px] flex-col justify-between">
                  <div className="text-center pb-0.5">
                    <span className="text-[7px] font-mono tracking-widest uppercase opacity-75 font-bold block">
                      KARTU 2 • POSE 3-4
                    </span>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <EditorialLandscapeCard poseNum={3} label="Pose 3" />
                    <EditorialLandscapeCard poseNum={4} label="Pose 4" />
                  </div>
                  <div className="mt-1 rounded bg-black/5 p-1 text-center border border-dashed border-black/10">
                    <span className="text-[8px] font-serif italic block">Together Forever</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-center text-xs font-semibold text-zinc-700 bg-white/90 px-4 py-1.5 rounded-full border border-zinc-200 shadow-2xs">
            {currentTemplate.headline}
          </div>
        </div>

        {/* RIGHT COLUMN: Touch Friendly Selection Controls */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4 h-full">
          {/* STEP 1: PILIH FORMAT KERTAS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                1. Pilih Format Kertas Cetak Landscape
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {currentTemplate.badge}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {TEMPLATES.map((tmpl) => {
                const isSelected = selectedFormatId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectFormat(tmpl)}
                    className={`relative flex min-h-[76px] flex-col justify-between rounded-xl p-3 text-left transition active:scale-95 border cursor-pointer ${
                      isSelected
                        ? "bg-white border-zinc-900 shadow-md ring-2 ring-zinc-900"
                        : "bg-white/80 border-zinc-200 hover:border-zinc-350 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-zinc-900">
                        {tmpl.shortName}
                      </span>
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isSelected
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : "border-zinc-300 bg-zinc-50 text-transparent"
                        }`}
                      >
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    </div>

                    <div className="mt-1">
                      <span className="text-xs font-bold text-zinc-900 block">
                        {tmpl.slotsCount} Pose
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate">
                        {tmpl.posesPerStrip} pose / lembar
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: PILIH DESAIN & WARNA FRAME */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                2. Pilih Desain dan Warna Frame
              </span>

              {/* Toggle: Koleksi Desain vs Warna Solid */}
              <div className="flex rounded-lg bg-zinc-200 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setThemeMode("THEMES");
                  }}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
                    themeMode === "THEMES"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  <span>Koleksi Desain</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setThemeMode("SOLID");
                    setSelectedThemeId("CLASSIC");
                  }}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
                    themeMode === "SOLID"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Palette className="h-3 w-3" />
                  <span>Warna Solid</span>
                </button>
              </div>
            </div>

            {/* TAB 1: KOLEKSI DESAIN TEMA */}
            {themeMode === "THEMES" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`flex min-h-[58px] items-center gap-2.5 rounded-xl p-2.5 text-left transition active:scale-95 border cursor-pointer ${
                        isSelected
                          ? "bg-white border-zinc-900 shadow-sm ring-2 ring-zinc-900"
                          : "bg-white/80 border-zinc-200 hover:border-zinc-350 hover:bg-white"
                      }`}
                    >
                      <div
                        style={{ backgroundColor: theme.bgHex, borderColor: theme.borderHex }}
                        className="h-8 w-8 rounded-lg border-2 shadow-2xs shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-zinc-900 block truncate">
                          {theme.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate block">
                          {theme.tagline}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: WARNA SOLID PALETTE */}
            {themeMode === "SOLID" && (
              <div className="grid grid-cols-3 gap-2">
                {SOLID_PALETTE.map((col) => {
                  const isSelected = selectedThemeId === "CLASSIC" && selectedColor === col.hex;
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => handleSelectColor(col.hex)}
                      className={`flex min-h-[58px] items-center gap-2.5 rounded-xl p-2.5 text-left transition active:scale-95 border cursor-pointer ${
                        isSelected
                          ? "bg-white border-zinc-900 shadow-sm ring-2 ring-zinc-900"
                          : "bg-white/80 border-zinc-200 hover:border-zinc-350 hover:bg-white"
                      }`}
                    >
                      <div
                        style={{ backgroundColor: col.hex }}
                        className="h-8 w-8 rounded-full border-2 border-zinc-300 shadow-2xs shrink-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">
                          {col.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {col.hex}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* LARGE TOUCH CTA BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-xl bg-zinc-900 px-6 text-base font-bold text-white shadow-md transition active:scale-[0.98] hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <span>Mulai Sesi Foto ({currentTemplate.slotsCount} Pose)</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="text-center text-[11px] text-zinc-600 mt-1.5">
              {currentTemplate.subHeadline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
