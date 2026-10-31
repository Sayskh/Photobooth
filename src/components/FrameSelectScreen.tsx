"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, ChevronRight, Layers, Palette } from "lucide-react";
import { sounds } from "@/lib/sound";

export interface TemplateChoice {
  id: string;
  name: string;
  shortName: string;
  category: "STRIP";
  layoutType: "STRIP_2X6_3" | "STRIP_2X6_4";
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
  { id: "CLASSIC", name: "Studio Minimal", tagline: "Border bersih warna solid", bgHex: "#FFFFFF", textColor: "#18181B", borderHex: "#E4E4E7" },
  { id: "THEATER_TICKET", name: "Archive Ticket", tagline: "Vintage tiket bioskop & barcode", bgHex: "#FDF8F0", textColor: "#881337", borderHex: "#881337" },
  { id: "Y2K_CHECKER", name: "Y2K Street", tagline: "Checkerboard retro starburst", bgHex: "#1E3A8A", textColor: "#FFFFFF", borderHex: "#1E3A8A" },
  { id: "GREEN_CAFE", name: "Seoul Cafe", tagline: "Retro diner guest check", bgHex: "#15803D", textColor: "#FFFFFF", borderHex: "#15803D" },
  { id: "POP_YELLOW", name: "Rad Yellow", tagline: "Bold high-contrast pop", bgHex: "#FACC15", textColor: "#18181B", borderHex: "#18181B" },
  { id: "FILM_NOIR", name: "Film Noir", tagline: "Gritty monokrom sinematik", bgHex: "#1C1917", textColor: "#F5F5F4", borderHex: "#44403C" },
  { id: "CHERRY_BLOSSOM", name: "Cherry Blossom", tagline: "Pastel Japanese sakura", bgHex: "#FFF1F2", textColor: "#9F1239", borderHex: "#FDA4AF" },
  { id: "CYBER_NEON", name: "Cyber Neon", tagline: "Futuristik glow malam", bgHex: "#0F0B15", textColor: "#A855F7", borderHex: "#7C3AED" },
  { id: "RETRO_COMIC", name: "Retro Comic", tagline: "Halftone pop art bergaya", bgHex: "#FEF9C3", textColor: "#B91C1C", borderHex: "#DC2626" },
  { id: "SUNSET_WARM", name: "Sunset Gradient", tagline: "Hangat keemasan senja", bgHex: "#FFF7ED", textColor: "#9A3412", borderHex: "#FB923C" },
  { id: "OCEAN_BREEZE", name: "Ocean Breeze", tagline: "Biru laut tenang", bgHex: "#F0F9FF", textColor: "#0C4A6E", borderHex: "#38BDF8" },
  { id: "FOREST_MOSS", name: "Forest Moss", tagline: "Hijau hutan organik", bgHex: "#F0FDF4", textColor: "#14532D", borderHex: "#4ADE80" },
];

export const SOLID_PALETTE = [
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

export const TEMPLATES: TemplateChoice[] = [
  {
    id: "template-strip-3",
    name: "2×6\" 3 Photo (Twin Strip)",
    shortName: "2×6\" 3 Photo",
    category: "STRIP",
    layoutType: "STRIP_2X6_3",
    slotsCount: 3,
    posesPerStrip: 3,
    printCopies: 2,
    badge: "2×6\" 3 Photo • Favorit",
    headline: "3 Pose Vertikal (2 Strip Kembar 2×6\")",
    subHeadline: "Format strip klasik 3 foto bertingkat, dicetak 2 lembar kembar pada kertas 4R",
  },
  {
    id: "template-strip-4",
    name: "2×6\" 4 Photo (Life4Cuts)",
    shortName: "2×6\" 4 Photo",
    category: "STRIP",
    layoutType: "STRIP_2X6_4",
    slotsCount: 4,
    posesPerStrip: 4,
    printCopies: 2,
    badge: "2×6\" 4 Photo • Korean 4-Cuts",
    headline: "4 Pose Vertikal (2 Strip Kembar 2×6\")",
    subHeadline: "Format strip populer Korea dengan 4 foto bertingkat sinematik",
  },
];

interface FrameSelectScreenProps {
  onBack: () => void;
  onSelectTemplate: (template: TemplateChoice, themeId: string, frameColor: string) => void;
  initialTemplateId?: string;
  initialThemeId?: string;
  initialFrameColor?: string;
}

// Mini Silhouette preview corresponding to user reference image
function TemplateSilhouetteIcon({ layoutType }: { layoutType: string }) {
  if (layoutType === "STRIP_2X6_4") {
    return (
      <div className="flex h-10 w-4.5 flex-col justify-between rounded-[2px] bg-zinc-900 p-[2px] border border-zinc-700 shadow-2xs">
        <div className="h-1.5 w-full rounded-[1px] bg-white" />
        <div className="h-1.5 w-full rounded-[1px] bg-white" />
        <div className="h-1.5 w-full rounded-[1px] bg-white" />
        <div className="h-1.5 w-full rounded-[1px] bg-white" />
        <div className="h-1.5 w-full bg-zinc-900" />
      </div>
    );
  }

  // Default: STRIP_2X6_3
  return (
    <div className="flex h-10 w-4.5 flex-col justify-between rounded-[2px] bg-zinc-900 p-[2px] border border-zinc-700 shadow-2xs">
      <div className="h-2 w-full rounded-[1px] bg-white" />
      <div className="h-2 w-full rounded-[1px] bg-white" />
      <div className="h-2 w-full rounded-[1px] bg-white" />
      <div className="h-1.5 w-full bg-zinc-900" />
    </div>
  );
}

// Clean editorial slot for live mockup
function EditorialPoseSlot({
  poseNum,
  label,
}: {
  poseNum: number;
  label: string;
}) {
  return (
    <div className="relative flex flex-1 w-full flex-col items-center justify-between overflow-hidden rounded-[3px] p-0.5 bg-zinc-200/90 text-zinc-800 border border-black/5 select-none min-h-[32px]">
      <div className="flex w-full items-center justify-between opacity-50 text-[5px] font-mono tracking-wider">
        <span>P{poseNum}</span>
        <span>4:3</span>
      </div>

      <svg
        viewBox="0 0 64 64"
        fill="currentColor"
        className="h-3.5 w-3.5 opacity-25 my-auto"
        aria-hidden="true"
      >
        <circle cx="32" cy="22" r="14" />
        <path d="M12 56c0-11 9-20 20-20s20 9 20 20H12z" />
      </svg>

      <span className="text-[6px] font-semibold tracking-tight text-center opacity-80 truncate w-full">
        {label}
      </span>
    </div>
  );
}

export function FrameSelectScreen({
  onBack,
  onSelectTemplate,
  initialTemplateId = "template-strip-3",
  initialThemeId = "CHERRY_BLOSSOM",
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
    <div className="relative flex min-h-dvh flex-col justify-between studio-bg p-4 md:p-5 select-none font-sans overflow-y-auto no-scrollbar text-zinc-900">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2.5">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-700 border border-zinc-200 shadow-xs tap-bounce hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-700" />
          <span>Kembali</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-600 uppercase block">
            Langkah 1 dari 3 • Konfigurasi Format
          </span>
          <h2 className="text-base md:text-lg font-bold tracking-tight text-zinc-900 mt-0.5">
            Pilih Desain Template & Frame Vertikal
          </h2>
        </div>

        <div className="w-32 text-right">
          <span className="rounded-lg bg-zinc-200/70 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 border border-zinc-200">
            Format: 4R Twin Strip
          </span>
        </div>
      </div>

      {/* Main Touch Interaction Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-auto max-w-6xl w-full mx-auto items-center flex-1 py-1 overflow-hidden">
        {/* LEFT COLUMN: Physical Paper Sheet Live Mockup (2:3 Portrait) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs h-full max-h-[500px]">
          <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-600 mb-1.5 px-1">
            <span className="font-bold uppercase tracking-wider text-zinc-800 truncate max-w-[200px]">
              {currentTemplate.shortName}
            </span>
            <span className="font-semibold text-zinc-600">{currentTemplate.slotsCount} Total Pose</span>
          </div>

          {/* PHYSICAL SHEET MOCKUP CONTAINER (2:3 PORTRAIT 4R) */}
          <div className="relative flex items-center justify-center w-full flex-1 max-h-[380px]">
            {/* 1. STRIP_2X6_3 (2x6" 3 Photo - 2 Strips Side by Side) */}
            {currentTemplate.layoutType === "STRIP_2X6_3" && (
              <div className="flex items-center justify-center gap-3">
                {/* STRIP 1 */}
                <div
                  style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                  className="flex h-[350px] w-[112px] flex-col justify-between rounded-lg p-2 shadow-md border border-zinc-200/90 transition-colors duration-200"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <EditorialPoseSlot poseNum={1} label="Pose 1" />
                    <EditorialPoseSlot poseNum={2} label="Pose 2" />
                    <EditorialPoseSlot poseNum={3} label="Pose 3" />
                  </div>
                  <div className="flex w-full flex-col items-center justify-center rounded bg-black/5 p-1 border border-black/10 text-center mt-1">
                    <span className="text-[6px] font-mono font-bold uppercase tracking-wider block opacity-75">
                      STRIP 1
                    </span>
                    <span className="text-[8px] font-bold block leading-tight">REBOOTH</span>
                    <span className="text-[5px] font-mono opacity-60 block">300 DPI</span>
                  </div>
                </div>

                {/* STRIP 2 */}
                <div
                  style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                  className="flex h-[350px] w-[112px] flex-col justify-between rounded-lg p-2 shadow-md border border-zinc-200/90 transition-colors duration-200"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <EditorialPoseSlot poseNum={1} label="Pose 1" />
                    <EditorialPoseSlot poseNum={2} label="Pose 2" />
                    <EditorialPoseSlot poseNum={3} label="Pose 3" />
                  </div>
                  <div className="flex w-full flex-col items-center justify-center rounded bg-black/5 p-1 border border-black/10 text-center mt-1">
                    <span className="text-[6px] font-mono font-bold uppercase tracking-wider block opacity-75">
                      STRIP 2
                    </span>
                    <span className="text-[8px] font-bold block leading-tight">REBOOTH</span>
                    <span className="text-[5px] font-mono opacity-60 block">300 DPI</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. STRIP_2X6_4 (2x6" 4 Photo - Korean 4-Cuts) */}
            {currentTemplate.layoutType === "STRIP_2X6_4" && (
              <div className="flex items-center justify-center gap-3">
                {/* STRIP 1 */}
                <div
                  style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                  className="flex h-[350px] w-[112px] flex-col justify-between rounded-lg p-2 shadow-md border border-zinc-200/90 transition-colors duration-200"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <EditorialPoseSlot poseNum={1} label="Pose 1" />
                    <EditorialPoseSlot poseNum={2} label="Pose 2" />
                    <EditorialPoseSlot poseNum={3} label="Pose 3" />
                    <EditorialPoseSlot poseNum={4} label="Pose 4" />
                  </div>
                  <div className="flex w-full flex-col items-center justify-center rounded bg-black/5 p-0.5 border border-black/10 text-center mt-1">
                    <span className="text-[6px] font-mono font-bold uppercase block opacity-75">
                      4-CUTS
                    </span>
                    <span className="text-[7px] font-bold block leading-tight">REBOOTH</span>
                  </div>
                </div>

                {/* STRIP 2 */}
                <div
                  style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                  className="flex h-[350px] w-[112px] flex-col justify-between rounded-lg p-2 shadow-md border border-zinc-200/90 transition-colors duration-200"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <EditorialPoseSlot poseNum={1} label="Pose 1" />
                    <EditorialPoseSlot poseNum={2} label="Pose 2" />
                    <EditorialPoseSlot poseNum={3} label="Pose 3" />
                    <EditorialPoseSlot poseNum={4} label="Pose 4" />
                  </div>
                  <div className="flex w-full flex-col items-center justify-center rounded bg-black/5 p-0.5 border border-black/10 text-center mt-1">
                    <span className="text-[6px] font-mono font-bold uppercase block opacity-75">
                      4-CUTS
                    </span>
                    <span className="text-[7px] font-bold block leading-tight">REBOOTH</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-center text-xs font-semibold text-zinc-700 bg-zinc-100 px-3.5 py-1 rounded-lg border border-zinc-200">
            {currentTemplate.headline}
          </div>
        </div>

        {/* RIGHT COLUMN: Touch Friendly Selection Controls */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3.5 h-full">
          {/* STEP 1: PILIH TEMPLATE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                1. Pilih Format Template Desain
              </span>
            </div>

            {/* Template Card Selection Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {TEMPLATES.map((tmpl) => {
                const isSelected = selectedFormatId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectFormat(tmpl)}
                    className={`relative flex min-h-[66px] items-center gap-3 rounded-xl p-3 text-left transition tap-bounce border cursor-pointer ${
                      isSelected
                        ? "bg-white border-[#1d1d1f] shadow-xs ring-2 ring-zinc-900"
                        : "bg-white border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50"
                    }`}
                  >
                    <TemplateSilhouetteIcon layoutType={tmpl.layoutType} />

                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 truncate">
                          {tmpl.shortName}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-zinc-900 shrink-0" />}
                      </div>
                      <span className="text-[11px] font-medium text-zinc-600 block mt-0.5">
                        {tmpl.slotsCount} Pose • {tmpl.printCopies} Lembar
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
                2. Pilih Desain & Warna Frame
              </span>

              {/* Toggle: Koleksi Desain vs Warna Solid */}
              <div className="flex rounded-xl bg-zinc-200/80 p-1 text-[11px] font-semibold border border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setThemeMode("THEMES");
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition cursor-pointer ${
                    themeMode === "THEMES"
                      ? "bg-white text-zinc-900 shadow-xs"
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
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition cursor-pointer ${
                    themeMode === "SOLID"
                      ? "bg-white text-zinc-900 shadow-xs"
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[170px] overflow-y-auto pr-1">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`flex min-h-[52px] items-center gap-2 rounded-xl p-2 text-left transition tap-bounce border cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#1d1d1f] shadow-xs ring-2 ring-zinc-900"
                          : "bg-white border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50"
                      }`}
                    >
                      <div
                        style={{ backgroundColor: theme.bgHex, borderColor: theme.borderHex }}
                        className="h-7 w-7 rounded-lg border shadow-2xs shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-zinc-900 block truncate">
                          {theme.name}
                        </span>
                        <span className="text-[10px] text-zinc-600 truncate block font-normal">
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
              <div className="grid grid-cols-3 gap-2 max-h-[170px] overflow-y-auto pr-1">
                {SOLID_PALETTE.map((col) => {
                  const isSelected = selectedThemeId === "CLASSIC" && selectedColor === col.hex;
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => handleSelectColor(col.hex)}
                      className={`flex min-h-[52px] items-center gap-2 rounded-xl p-2 text-left transition tap-bounce border cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#1d1d1f] shadow-xs ring-2 ring-zinc-900"
                          : "bg-white border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50"
                      }`}
                    >
                      <div
                        style={{ backgroundColor: col.hex }}
                        className="h-7 w-7 rounded-full border-2 border-zinc-300 shadow-2xs shrink-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">
                          {col.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-600">
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
          <div className="pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#1d1d1f] px-6 text-sm md:text-base font-semibold text-white shadow-xs tap-bounce hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <span>Mulai Sesi Foto ({currentTemplate.slotsCount} Pose)</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="text-center text-[11px] text-zinc-600 font-normal mt-1">
              {currentTemplate.subHeadline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
