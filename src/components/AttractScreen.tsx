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

  return (
    <div
      onClick={handleStart}
      className="relative flex h-screen w-screen flex-col items-center justify-between bg-zinc-50 px-8 py-10 select-none cursor-pointer font-sans"
    >
      {/* Top Header */}
      <div className="flex w-full max-w-4xl items-center justify-between">
        <button
          type="button"
          onClick={handleLogoTap}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleLogoTap(e);
            }
          }}
          className="flex items-center gap-2.5 rounded-lg bg-white px-4 py-2 border border-zinc-200 shadow-2xs transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          aria-label="KioskSnap logo"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
            <Camera className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-900">
            KioskSnap
          </span>
          {logoTapCount > 0 && (
            <span className="text-xs text-zinc-600 font-mono">
              ({5 - logoTapCount})
            </span>
          )}
        </button>

        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          <span>Self-Service Photobooth Kiosk</span>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="flex flex-col items-center text-center max-w-xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          Abadikan Momen Terbaikmu
        </h1>

        <p className="mt-4 text-sm text-zinc-600 max-w-md leading-relaxed">
          Pilih tata letak frame estetik, ambil foto bebas pose selama sesi berlangsung, tambahkan filter dan stiker, lalu bawa pulang cetakan fisik dan softfile ke ponsel.
        </p>

        {/* Big Touch Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleStart();
          }}
          className="mt-8 flex min-h-[52px] items-center gap-3 rounded-xl bg-zinc-900 px-8 py-3.5 text-white shadow-sm transition hover:bg-zinc-800 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <span className="text-base font-bold tracking-wide">
            Sentuh Layar Untuk Memulai
          </span>
          <ChevronRight className="h-5 w-5 text-zinc-300" />
        </button>
      </div>

      {/* Feature Badges */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl text-center">
        <div className="flex flex-col items-center rounded-xl bg-white p-3.5 border border-zinc-200 shadow-2xs">
          <Printer className="h-5 w-5 text-zinc-800 mb-1" />
          <span className="text-xs font-bold text-zinc-900">2 Strip Cetak Fisik</span>
          <span className="text-[11px] text-zinc-600">Termasuk dalam paket</span>
        </div>

        <div className="flex flex-col items-center rounded-xl bg-white p-3.5 border border-zinc-200 shadow-2xs">
          <RefreshCw className="h-5 w-5 text-zinc-800 mb-1" />
          <span className="text-xs font-bold text-zinc-900">Bebas Foto Ulang</span>
          <span className="text-[11px] text-zinc-600">Retake sepuasnya selama sesi</span>
        </div>

        <div className="flex flex-col items-center rounded-xl bg-white p-3.5 border border-zinc-200 shadow-2xs">
          <Smartphone className="h-5 w-5 text-zinc-800 mb-1" />
          <span className="text-xs font-bold text-zinc-900">Softfile QR Instan</span>
          <span className="text-[11px] text-zinc-600">Unduh langsung ke ponsel</span>
        </div>
      </div>
    </div>
  );
}
