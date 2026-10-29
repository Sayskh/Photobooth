"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, ChevronRight, Layers, Palette } from "lucide-react";
import { sounds } from "@/lib/sound";

export interface TemplateChoice {
  id: string;
  name: string;
  shortName: string;
  category: "STRIP" | "CARD";
  layoutType:
    | "STRIP_2X6_3"
    | "STRIP_2X6_4"
    | "CARD_4X6_6"
    | "CARD_4X6_4"
    | "CARD_4X6_TRIPLE"
    | "CARD_4X6_2"
    | "CARD_4X6_1"
    | "STRIP_2X6"
    | "GRID_4X6"
    | "POLAROID";
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
  {
    id: "template-card-6",
    name: "4×6\" 6 Photo (Grid 2×3)",
    shortName: "4×6\" 6 Photo",
    category: "CARD",
    layoutType: "CARD_4X6_6",
    slotsCount: 6,
    posesPerStrip: 6,
    printCopies: 1,
    badge: "4×6\" 6 Photo • Kolase",
    headline: "6 Pose Grid (2 Kolom × 3 Baris)",
    subHeadline: "1 lembar kartu 4R penuh memuat 6 pose seru bersama teman kelompok",
  },
  {
    id: "template-grid-4",
    name: "4×6\" 4 Photo (Grid 2×2)",
    shortName: "4×6\" 4 Photo",
    category: "CARD",
    layoutType: "CARD_4X6_4",
    slotsCount: 4,
    posesPerStrip: 4,
    printCopies: 1,
    badge: "4×6\" 4 Photo • Postcard",
    headline: "4 Pose Grid (Kartu Pos 4R Vertikal)",
    subHeadline: "1 lembar kartu pos tebal 10×15 cm dengan 4 foto lebar proporsional",
  },
  {
    id: "template-card-triple",
    name: "4×6\" Triple Photo (3 Kolom)",
    shortName: "4×6\" Triple",
    category: "CARD",
    layoutType: "CARD_4X6_TRIPLE",
    slotsCount: 3,
    posesPerStrip: 3,
    printCopies: 1,
    badge: "4×6\" Triple Photo",
    headline: "3 Pose Berdampingan (Kartu 4R)",
    subHeadline: "3 foto tegak berjajar sejajar dengan ruang branding artistik di bawah",
  },
  {
    id: "template-duo-2",
    name: "4×6\" 2 Photo (Duo)",
    shortName: "4×6\" 2 Photo",
    category: "CARD",
    layoutType: "CARD_4X6_2",
    slotsCount: 2,
    posesPerStrip: 2,
    printCopies: 1,
    badge: "4×6\" 2 Photo • Duo",
    headline: "2 Pose Sinematik (Kartu 4R)",
    subHeadline: "2 foto berukuran besar untuk pasangan atau sahabat dekat",
  },
  {
    id: "template-card-single",
    name: "4×6\" Portrait Single Photo",
    shortName: "4×6\" Single",
    category: "CARD",
    layoutType: "CARD_4X6_1",
    slotsCount: 1,
    posesPerStrip: 1,
    printCopies: 1,
    badge: "4×6\" Single Photo • Polaroid",
    headline: "1 Pose Utama (Polaroid Jumbo 4R)",
    subHeadline: "1 foto tunggal beresolusi tinggi dengan bingkai tebal bergaya polaroid",
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
  if (layoutType === "STRIP_2X6_3" || layoutType === "STRIP_2X6") {
    return (
      <div className="flex h-10 w-4.5 flex-col justify-between rounded-[2px] bg-zinc-900 p-[2px] border border-zinc-700 shadow-2xs">
        <div className="h-2 w-full rounded-[1px] bg-white" />
        <div className="h-2 w-full rounded-[1px] bg-white" />
        <div className="h-2 w-full rounded-[1px] bg-white" />
        <div className="h-1.5 w-full bg-zinc-900" />
      </div>
    );
  }

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

  if (layoutType === "CARD_4X6_6") {
    return (
      <div className="flex h-10 w-7 flex-col justify-between rounded-[2px] bg-zinc-900 p-[2px] border border-zinc-700 shadow-2xs">
        <div className="grid grid-cols-2 gap-[1.5px] flex-1">
          <div className="h-2 rounded-[1px] bg-white" />
          <div className="h-2 rounded-[1px] bg-white" />
          <div className="h-2 rounded-[1px] bg-white" />
          <div className="h-2 rounded-[1px] bg-white" />
          <div className="h-2 rounded-[1px] bg-white" />
          <div className="h-2 rounded-[1px] bg-white" />
        </div>
        <div className="h-1.5 w-full bg-zinc-900" />
      </div>
    );
  }

  if (layoutType === "CARD_4X6_4" || layoutType === "GRID_4X6") {
    return (
      <div className="flex h-10 w-7 flex-col justify-between rounded-[2px] bg-zinc-900 p-[2px] border border-zinc-700 shadow-2xs">
        <div className="grid grid-cols-2 gap-[2px] flex-1">
          <div className="h-3 rounded-[1px] bg-white" />
          <div className="h-3 rounded-[1px] bg-white" />
          <div className="h-3 rounded-[1px] bg-white" />
          <div className="h-3 rounded-[1px] bg-white" />
        </div>
        <div className="h-2 w-full bg-zinc-900" />
      </div>
    );
  }

  if (layoutType === "CARD_4X6_TRIPLE") {
    return (
      <div className="flex h-10 w-7 flex-col justify-between rounded-[2px] bg-zinc-900 p-[2px] border border-zinc-700 shadow-2xs">
        <div className="flex gap-[1.5px] flex-1">
          <div className="h-full flex-1 rounded-[1px] bg-white" />
          <div className="h-full flex-1 rounded-[1px] bg-white" />
          <div className="h-full flex-1 rounded-[1px] bg-white" />
        </div>
        <div className="h-2 w-full bg-zinc-900" />
      </div>
    );
  }

  if (layoutType === "CARD_4X6_2" || layoutType === "POLAROID") {
    return (
      <div className="flex h-10 w-7 flex-col justify-between rounded-[2px] bg-zinc-900 p-[2px] border border-zinc-700 shadow-2xs">
        <div className="flex flex-col gap-[2px] flex-1">
          <div className="h-3 w-full rounded-[1px] bg-white" />
          <div className="h-3 w-full rounded-[1px] bg-white" />
        </div>
        <div className="h-2 w-full bg-zinc-900" />
      </div>
    );
  }

  // CARD_4X6_1 (Single)
  return (
    <div className="flex h-10 w-7 flex-col justify-between rounded-[2px] bg-zinc-900 p-[2px] border border-zinc-700 shadow-2xs">
      <div className="h-6 w-full rounded-[1px] bg-white" />
      <div className="h-2.5 w-full bg-zinc-900" />
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
  initialThemeId = "THEATER_TICKET",
  initialFrameColor = "#FFFFFF",
}: FrameSelectScreenProps) {
  const [selectedFormatId, setSelectedFormatId] = useState<string>(initialTemplateId);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "STRIP" | "CARD">("ALL");
  const [themeMode, setThemeMode] = useState<"THEMES" | "SOLID">("THEMES");
  const [selectedThemeId, setSelectedThemeId] = useState<string>(initialThemeId);
  const [selectedColor, setSelectedColor] = useState<string>(initialFrameColor);

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedFormatId) || TEMPLATES[0];
  const currentTheme = THEME_OPTIONS.find((t) => t.id === selectedThemeId) || THEME_OPTIONS[0];

  const filteredTemplates = TEMPLATES.filter((t) => {
    if (selectedCategory === "STRIP") return t.category === "STRIP";
    if (selectedCategory === "CARD") return t.category === "CARD";
    return true;
  });

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
    <div className="relative flex h-screen w-screen flex-col justify-between bg-zinc-100 p-4 md:p-5 select-none font-sans overflow-hidden text-zinc-900">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/90 pb-2.5">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 border border-zinc-200 shadow-2xs transition active:scale-95 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">
            Langkah 1 dari 3 • Konfigurasi Format
          </span>
          <h2 className="text-base md:text-lg font-bold tracking-tight text-zinc-900 mt-0.5">
            Pilih Desain Template & Frame Vertikal
          </h2>
        </div>

        <div className="w-32 text-right font-mono text-xs font-semibold text-zinc-600">
          Format: 4R Vertikal
        </div>
      </div>

      {/* Main Touch Interaction Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-auto max-w-6xl w-full mx-auto items-center flex-1 py-1 overflow-hidden">
        {/* LEFT COLUMN: Physical Paper Sheet Live Mockup (2:3 Portrait) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3.5 rounded-2xl bg-zinc-200/60 border border-zinc-300/80 shadow-inner h-full max-h-[500px]">
          <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-600 mb-1.5 px-1">
            <span className="font-bold uppercase tracking-wider text-zinc-800 truncate max-w-[200px]">
              {currentTemplate.shortName}
            </span>
            <span className="font-semibold">{currentTemplate.slotsCount} Total Pose</span>
          </div>

          {/* PHYSICAL SHEET MOCKUP CONTAINER (2:3 PORTRAIT 4R) */}
          <div className="relative flex items-center justify-center w-full flex-1 max-h-[380px]">
            {/* 1. STRIP_2X6_3 (2x6" 3 Photo - 2 Strips Side by Side) */}
            {(currentTemplate.layoutType === "STRIP_2X6_3" ||
              currentTemplate.layoutType === "STRIP_2X6") && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[350px] w-[234px] justify-between rounded-lg p-2 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                {/* STRIP 1 (LEFT) */}
                <div className="flex h-full w-[104px] flex-col justify-between gap-1">
                  <div className="flex flex-col gap-1 flex-1">
                    <EditorialPoseSlot poseNum={1} label="Pose 1" />
                    <EditorialPoseSlot poseNum={2} label="Pose 2" />
                    <EditorialPoseSlot poseNum={3} label="Pose 3" />
                  </div>
                  <div className="flex w-full flex-col items-center justify-center rounded bg-black/5 p-1 border border-black/10 text-center">
                    <span className="text-[6px] font-mono font-bold uppercase tracking-wider block opacity-75">
                      STRIP 1
                    </span>
                    <span className="text-[8px] font-bold block leading-tight">KIOSKSNAP</span>
                    <span className="text-[5px] font-mono opacity-60 block">300 DPI</span>
                  </div>
                </div>

                {/* Perforation Guideline (Vertical) */}
                <div className="relative flex h-full flex-col items-center justify-center px-0.5">
                  <div className="h-full border-r border-dashed border-zinc-400 opacity-60" />
                  <span className="absolute text-[6px] font-mono text-zinc-600 bg-white/90 px-1 py-0.5 rounded border border-zinc-200 shadow-2xs whitespace-nowrap">
                    ✄ POTONG
                  </span>
                </div>

                {/* STRIP 2 (RIGHT) */}
                <div className="flex h-full w-[104px] flex-col justify-between gap-1">
                  <div className="flex flex-col gap-1 flex-1">
                    <EditorialPoseSlot poseNum={1} label="Pose 1" />
                    <EditorialPoseSlot poseNum={2} label="Pose 2" />
                    <EditorialPoseSlot poseNum={3} label="Pose 3" />
                  </div>
                  <div className="flex w-full flex-col items-center justify-center rounded bg-black/5 p-1 border border-black/10 text-center">
                    <span className="text-[6px] font-mono font-bold uppercase tracking-wider block opacity-75">
                      STRIP 2
                    </span>
                    <span className="text-[8px] font-bold block leading-tight">KIOSKSNAP</span>
                    <span className="text-[5px] font-mono opacity-60 block">300 DPI</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. STRIP_2X6_4 (2x6" 4 Photo - Korean 4-Cuts) */}
            {currentTemplate.layoutType === "STRIP_2X6_4" && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[350px] w-[234px] justify-between rounded-lg p-2 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                {/* STRIP 1 (LEFT) */}
                <div className="flex h-full w-[104px] flex-col justify-between gap-1">
                  <div className="flex flex-col gap-1 flex-1">
                    <EditorialPoseSlot poseNum={1} label="Pose 1" />
                    <EditorialPoseSlot poseNum={2} label="Pose 2" />
                    <EditorialPoseSlot poseNum={3} label="Pose 3" />
                    <EditorialPoseSlot poseNum={4} label="Pose 4" />
                  </div>
                  <div className="flex w-full flex-col items-center justify-center rounded bg-black/5 p-0.5 border border-black/10 text-center">
                    <span className="text-[6px] font-mono font-bold uppercase block opacity-75">
                      4-CUTS
                    </span>
                    <span className="text-[7px] font-bold block leading-tight">KIOSKSNAP</span>
                  </div>
                </div>

                {/* Perforation Guideline (Vertical) */}
                <div className="relative flex h-full flex-col items-center justify-center px-0.5">
                  <div className="h-full border-r border-dashed border-zinc-400 opacity-60" />
                  <span className="absolute text-[6px] font-mono text-zinc-600 bg-white/90 px-1 py-0.5 rounded border border-zinc-200 shadow-2xs whitespace-nowrap">
                    ✄ POTONG
                  </span>
                </div>

                {/* STRIP 2 (RIGHT) */}
                <div className="flex h-full w-[104px] flex-col justify-between gap-1">
                  <div className="flex flex-col gap-1 flex-1">
                    <EditorialPoseSlot poseNum={1} label="Pose 1" />
                    <EditorialPoseSlot poseNum={2} label="Pose 2" />
                    <EditorialPoseSlot poseNum={3} label="Pose 3" />
                    <EditorialPoseSlot poseNum={4} label="Pose 4" />
                  </div>
                  <div className="flex w-full flex-col items-center justify-center rounded bg-black/5 p-0.5 border border-black/10 text-center">
                    <span className="text-[6px] font-mono font-bold uppercase block opacity-75">
                      4-CUTS
                    </span>
                    <span className="text-[7px] font-bold block leading-tight">KIOSKSNAP</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CARD_4X6_6 (4x6" 6 Photo - 2x3 Grid) */}
            {currentTemplate.layoutType === "CARD_4X6_6" && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[350px] w-[234px] flex-col justify-between rounded-xl p-2.5 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                <div className="grid grid-cols-2 gap-1 flex-1 max-h-[235px]">
                  <EditorialPoseSlot poseNum={1} label="Pose 1" />
                  <EditorialPoseSlot poseNum={2} label="Pose 2" />
                  <EditorialPoseSlot poseNum={3} label="Pose 3" />
                  <EditorialPoseSlot poseNum={4} label="Pose 4" />
                  <EditorialPoseSlot poseNum={5} label="Pose 5" />
                  <EditorialPoseSlot poseNum={6} label="Pose 6" />
                </div>
                <div className="flex flex-col gap-0.5 pt-1.5 border-t border-black/10 text-[7px] font-mono opacity-80">
                  <div className="flex justify-between items-center">
                    <span>4×6\" 6-SHOTS GRID</span>
                    <span>KIOSKSNAP</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CARD_4X6_4 (4x6" 4 Photo - 2x2 Grid) */}
            {(currentTemplate.layoutType === "CARD_4X6_4" ||
              currentTemplate.layoutType === "GRID_4X6") && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[350px] w-[234px] flex-col justify-between rounded-xl p-2.5 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                <div className="grid grid-cols-2 gap-1.5 flex-1 max-h-[220px]">
                  <EditorialPoseSlot poseNum={1} label="Pose 1" />
                  <EditorialPoseSlot poseNum={2} label="Pose 2" />
                  <EditorialPoseSlot poseNum={3} label="Pose 3" />
                  <EditorialPoseSlot poseNum={4} label="Pose 4" />
                </div>
                <div className="flex flex-col gap-1 pt-2 border-t border-black/10 text-[7px] font-mono opacity-80">
                  <div className="flex justify-between items-center">
                    <span>4×6\" 4 PHOTO POSTCARD</span>
                    <span>KIOSKSNAP</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. CARD_4X6_TRIPLE (4x6" Triple Photo) */}
            {currentTemplate.layoutType === "CARD_4X6_TRIPLE" && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[350px] w-[234px] flex-col justify-between rounded-xl p-2.5 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                <div className="flex gap-1.5 flex-1 max-h-[220px]">
                  <EditorialPoseSlot poseNum={1} label="Pose 1" />
                  <EditorialPoseSlot poseNum={2} label="Pose 2" />
                  <EditorialPoseSlot poseNum={3} label="Pose 3" />
                </div>
                <div className="flex flex-col gap-1 pt-2 border-t border-black/10 text-[7px] font-mono opacity-80">
                  <div className="flex justify-between items-center">
                    <span>4×6\" TRIPLE PHOTO</span>
                    <span>KIOSKSNAP</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. CARD_4X6_2 (4x6" 2 Photo) */}
            {(currentTemplate.layoutType === "CARD_4X6_2" ||
              currentTemplate.layoutType === "POLAROID") && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[350px] w-[234px] flex-col justify-between rounded-xl p-2.5 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                <div className="flex flex-col gap-1.5 flex-1 max-h-[230px]">
                  <EditorialPoseSlot poseNum={1} label="Pose 1" />
                  <EditorialPoseSlot poseNum={2} label="Pose 2" />
                </div>
                <div className="rounded bg-black/5 p-1 text-center border border-dashed border-black/10 mt-1">
                  <span className="text-[8px] font-serif italic block">Together Forever</span>
                </div>
              </div>
            )}

            {/* 7. CARD_4X6_1 (4x6" Single Photo) */}
            {currentTemplate.layoutType === "CARD_4X6_1" && (
              <div
                style={{ backgroundColor: getThemeBackgroundHex(), color: getThemeTextColor() }}
                className="relative flex h-[350px] w-[234px] flex-col justify-between rounded-xl p-2.5 shadow-xl border border-zinc-300 transition-colors duration-200"
              >
                <div className="flex-1 max-h-[250px] flex">
                  <EditorialPoseSlot poseNum={1} label="Pose Utama (Single)" />
                </div>
                <div className="rounded bg-black/5 p-1 text-center border border-dashed border-black/10 mt-1">
                  <span className="text-[9px] font-serif italic block">Sweet Memories</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-center text-xs font-semibold text-zinc-700 bg-white/90 px-3.5 py-1 rounded-full border border-zinc-200 shadow-2xs">
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

              {/* Category Filter Pills */}
              <div className="flex rounded-lg bg-zinc-200 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCategory("ALL");
                  }}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    selectedCategory === "ALL"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Semua ({TEMPLATES.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCategory("STRIP");
                  }}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    selectedCategory === "STRIP"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Strip 2×6\"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCategory("CARD");
                  }}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    selectedCategory === "CARD"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Kartu 4×6\"
                </button>
              </div>
            </div>

            {/* Template Card Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[195px] overflow-y-auto pr-1">
              {filteredTemplates.map((tmpl) => {
                const isSelected = selectedFormatId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectFormat(tmpl)}
                    className={`relative flex min-h-[64px] items-center gap-2.5 rounded-xl p-2.5 text-left transition active:scale-95 border cursor-pointer ${
                      isSelected
                        ? "bg-white border-zinc-900 shadow-md ring-2 ring-zinc-900"
                        : "bg-white/80 border-zinc-200 hover:border-zinc-350 hover:bg-white"
                    }`}
                  >
                    <TemplateSilhouetteIcon layoutType={tmpl.layoutType} />

                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 truncate">
                          {tmpl.shortName}
                        </span>
                        {isSelected && <Check className="h-3 w-3 text-zinc-900 shrink-0" />}
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-600 block">
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
              <div className="flex rounded-lg bg-zinc-200 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setThemeMode("THEMES");
                  }}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition cursor-pointer ${
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
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition cursor-pointer ${
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
                      className={`flex min-h-[52px] items-center gap-2 rounded-xl p-2 text-left transition active:scale-95 border cursor-pointer ${
                        isSelected
                          ? "bg-white border-zinc-900 shadow-sm ring-2 ring-zinc-900"
                          : "bg-white/80 border-zinc-200 hover:border-zinc-350 hover:bg-white"
                      }`}
                    >
                      <div
                        style={{ backgroundColor: theme.bgHex, borderColor: theme.borderHex }}
                        className="h-7 w-7 rounded-lg border-2 shadow-2xs shrink-0"
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
                      className={`flex min-h-[52px] items-center gap-2 rounded-xl p-2 text-left transition active:scale-95 border cursor-pointer ${
                        isSelected
                          ? "bg-white border-zinc-900 shadow-sm ring-2 ring-zinc-900"
                          : "bg-white/80 border-zinc-200 hover:border-zinc-350 hover:bg-white"
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
          <div className="pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-sm md:text-base font-bold text-white shadow-md transition active:scale-[0.98] hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <span>Mulai Sesi Foto ({currentTemplate.slotsCount} Pose)</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="text-center text-[10px] text-zinc-600 mt-1">
              {currentTemplate.subHeadline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
