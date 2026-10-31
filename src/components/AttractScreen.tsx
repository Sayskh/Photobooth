"use client";

import React, { useState } from "react";
import { Camera, Smartphone, Printer, RefreshCw, ChevronRight } from "lucide-react";
import { sounds } from "@/lib/sound";

interface AttractScreenProps {
  onStart: () => void;
  onOpenAdmin: () => void;
}

export function AttractScreen({ onStart, onOpenAdmin }: AttractScreenProps) {
  const [logoTapCount, setLogoTapCount] = useState(0);

  const handleLogoTap = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    sounds.playClick();
    const nextCount = logoTapCount + 1;
    if (nextCount >= 5) {
      setLogoTapCount(0);
      onOpenAdmin();
    } else {
      setLogoTapCount(nextCount);
      setTimeout(() => setLogoTapCount(0), 2000);
    }
  };

  const handleStart = () => {
    sounds.playClick();
    onStart();
  };

  // ponytail: solid studio canvas layout; add video backdrop when kiosk hardware specs allow
  return (
    <div
      onClick={handleStart}
      className="relative flex min-h-dvh w-full flex-col items-center justify-between studio-bg px-4 py-6 md:px-8 md:py-10 select-none cursor-pointer font-sans overflow-y-auto no-scrollbar"
    >
      {/* Top Header Navigation */}
      <div className="flex w-full max-w-4xl items-center justify-between z-10">
        <button
          type="button"
          onClick={handleLogoTap}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleLogoTap(e);
            }
          }}
          className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2 border border-zinc-200/80 shadow-xs tap-bounce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
          aria-label="KioskSnap logo"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1d1d1f] text-white">
            <Camera className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-900">
            KioskSnap
          </span>
          {logoTapCount > 0 && (
            <span className="text-xs text-zinc-400 font-mono">
              ({5 - logoTapCount})
            </span>
          )}
        </button>

        <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200/80 shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Self-Service Photobooth Kiosk</span>
        </div>
      </div>

      {/* Main Center Content Stage */}
      <div className="flex flex-col items-center text-center max-w-xl my-auto py-8 z-10">
        <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-200/60 px-3 py-1 text-xs font-semibold text-zinc-700 mb-4">
          <span>Studio Foto Interaktif</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.12]">
          Abadikan Momen Terbaik Bersama
        </h1>

        <p className="mt-3 md:mt-4 text-xs sm:text-sm text-zinc-600 max-w-md leading-relaxed font-normal">
          Pilih template frame, berpose bebas di depan kamera, beri sentuhan filter atau stiker, lalu dapatkan 2 lembar cetak fisik 4R beserta unduhan file digital.
        </p>

        {/* Apple-style Tactile Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleStart();
          }}
          className="mt-7 md:mt-9 flex min-h-[56px] items-center gap-3 rounded-2xl bg-[#1d1d1f] px-8 py-3.5 text-white shadow-sm tap-bounce hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
        >
          <span className="text-base font-semibold tracking-normal">
            Sentuh Layar Untuk Memulai
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
            <ChevronRight className="h-4 w-4 text-white" />
          </div>
        </button>
      </div>

      {/* Feature Cards in Clean Studio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-center mt-4 z-10">
        <div className="flex flex-col items-center rounded-2xl bg-white p-4 border border-zinc-200/80 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 mb-2">
            <Printer className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-bold text-zinc-900">2 Strip Cetak Fisik</span>
          <span className="text-[11px] text-zinc-500 mt-0.5">Format 4R twin strip instan</span>
        </div>

        <div className="flex flex-col items-center rounded-2xl bg-white p-4 border border-zinc-200/80 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 mb-2">
            <RefreshCw className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-bold text-zinc-900">Bebas Foto Ulang</span>
          <span className="text-[11px] text-zinc-500 mt-0.5">Ulang pose bila belum pas</span>
        </div>

        <div className="flex flex-col items-center rounded-2xl bg-white p-4 border border-zinc-200/80 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 mb-2">
            <Smartphone className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-bold text-zinc-900">Live Photo & Video</span>
          <span className="text-[11px] text-zinc-500 mt-0.5">Scan QR ke galeri ponsel</span>
        </div>
      </div>
    </div>
  );
}
