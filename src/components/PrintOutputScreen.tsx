"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import { Printer, QrCode, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { sounds } from "@/lib/sound";

interface PrintOutputScreenProps {
  sessionId: string;
  finalImage: string;
  qrToken: string;
  onReset: () => void;
}

const INCLUDED_COPIES = 2;

export function PrintOutputScreen({
  sessionId,
  finalImage,
  qrToken,
  onReset,
}: PrintOutputScreenProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(60);
  const hasAutoPrintedRef = useRef<boolean>(false);

  useEffect(() => {
    sounds.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const downloadUrl = `${origin}/download/${qrToken}`;

    QRCode.toDataURL(downloadUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#18181b",
        light: "#ffffff",
      },
    }).then((url) => {
      setQrCodeDataUrl(url);
    });
  }, [qrToken]);

  useEffect(() => {
    if (hasAutoPrintedRef.current) return;
    hasAutoPrintedRef.current = true;

    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/sessions/${sessionId}/print`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ copies: INCLUDED_COPIES }),
        });
      } catch (err) {
        console.error("Print record error:", err);
      }

      if (typeof window !== "undefined") {
        window.print();
      }

      setIsPrinting(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [sessionId]);

  useEffect(() => {
    if (countdown <= 0) {
      onReset();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onReset]);

  return (
    <>
      {/* Media print style */}
      <div className="hidden print-only">
        <div className="flex items-center justify-center p-0 m-0 w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={finalImage}
            alt="Print Output Sheet"
            className="w-full h-full object-contain"
            style={{ maxHeight: "100vh", maxWidth: "100vw" }}
          />
        </div>
      </div>

      {/* Screen View Kiosk */}
      <div className="no-print relative flex h-screen w-screen flex-col justify-between bg-zinc-50 p-6 select-none overflow-hidden font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                Foto Selesai dan Sedang Dicetak
              </h2>
              <p className="text-xs text-zinc-600">
                Cetak fisik otomatis diproses mesin printer. Pindai QR code untuk softfile digital.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onReset();
            }}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-100 active:scale-95 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Selesai Sesi ({countdown}s)</span>
          </button>
        </div>

        {/* Center Grid: Left Final Photo, Right Auto Print Status & QR */}
        <div className="flex flex-1 items-center justify-center gap-8 py-4 overflow-hidden">
          {/* Photo Preview Frame */}
          <div className="flex h-full max-h-[75vh] items-center justify-center rounded-2xl bg-zinc-100 p-4 border border-zinc-200 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={finalImage}
              alt="Final Output"
              className="max-h-full max-w-full rounded-lg object-contain shadow-sm border border-zinc-200"
            />
          </div>

          {/* Right Card: Auto Print Status & QR Softfile */}
          <div className="flex h-full max-h-[75vh] w-[430px] flex-col justify-between rounded-2xl bg-white p-6 border border-zinc-200 shadow-sm">
            {/* Top: Auto Print Status Indicator */}
            <div className="rounded-xl bg-zinc-50 p-5 border border-zinc-200">
              <div className="flex items-center gap-2 mb-3">
                <Printer className="h-5 w-5 text-zinc-800" />
                <span className="text-sm font-bold text-zinc-900">
                  Status Cetak Fisik
                </span>
              </div>

              {isPrinting ? (
                <div className="flex items-center gap-3 rounded-lg bg-white p-4 border border-zinc-200 shadow-2xs">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-900 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      Sedang Mencetak 2 Strip Foto...
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Perintah cetak telah dikirim otomatis ke printer kios.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      2 Strip Foto Berhasil Diproses!
                    </p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Silakan ambil strip foto fisik Anda di baki printer.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-3 text-[11px] text-zinc-600 leading-relaxed">
                Kios otomatis mencetak <strong>2 strip foto fisik</strong> berkualitas studio langsung tanpa perlu menekan tombol tambahan.
              </div>
            </div>

            {/* Bottom: QR Code Softfile */}
            <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-5 border border-zinc-200 text-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 mb-2">
                <QrCode className="h-4 w-4 text-zinc-700" />
                <span>Unduh Softfile ke Smartphone</span>
              </div>

              {qrCodeDataUrl ? (
                <div className="mb-2 rounded-lg bg-white p-2 border border-zinc-200 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Softfile"
                    className="h-34 w-34 object-contain"
                  />
                </div>
              ) : (
                <div className="h-34 w-34 flex items-center justify-center text-xs text-zinc-500">
                  Membuat QR...
                </div>
              )}

              <p className="text-[11px] text-zinc-600 max-w-xs leading-relaxed">
                Pindai dengan kamera ponsel untuk mengunduh softfile komposit dan seluruh foto pose asli tanpa watermark.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center text-xs font-medium text-zinc-600">
          Terima kasih telah berfoto di KioskSnap! Sesi akan otomatis berakhir dalam {countdown} detik.
        </div>
      </div>
    </>
  );
}
