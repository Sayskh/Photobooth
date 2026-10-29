"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Download,
  Camera,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { exportStripsFromComposite } from "@/lib/canvas";

interface DownloadPayload {
  compositeImage: string;
  layoutType: string;
  shots: Array<{ poseIndex: number; image: string }>;
  createdAt: string;
}

export default function DownloadPage() {
  const params = useParams();
  const token = params?.token as string;

  const [data, setData] = useState<DownloadPayload | null>(null);
  const [strips, setStrips] = useState<{ strip1: string; strip2: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/download/${token}`)
      .then((res) => res.json())
      .then(async (resData) => {
        if (resData.success) {
          setData(resData);
          if (resData.compositeImage) {
            try {
              const sliced = await exportStripsFromComposite(
                resData.compositeImage,
                resData.layoutType || "STRIP_2X6"
              );
              setStrips(sliced);
            } catch (err) {
              console.error("Gagal mengekstrak strip foto:", err);
            }
          }
        } else {
          setErrorMsg(resData.message || "Foto tidak ditemukan.");
        }
      })
      .catch(() => {
        setErrorMsg("Gagal memuat berkas foto.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const handleDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (!data || isDownloadingAll) return;
    setIsDownloadingAll(true);

    const queue: Array<{ url: string; name: string }> = [];

    // 1. Sliced strips
    if (strips) {
      queue.push({
        url: strips.strip1,
        name: `KioskSnap-Strip-1-${token.slice(0, 6)}.png`,
      });
      queue.push({
        url: strips.strip2,
        name: `KioskSnap-Strip-2-${token.slice(0, 6)}.png`,
      });
    }

    // 2. Full composite 4R
    if (data.compositeImage) {
      queue.push({
        url: data.compositeImage,
        name: `KioskSnap-Lembar-4R-${token.slice(0, 6)}.png`,
      });
    }

    // 3. Raw shots
    if (data.shots && data.shots.length > 0) {
      data.shots.forEach((s) => {
        queue.push({
          url: s.image,
          name: `KioskSnap-Pose-${s.poseIndex}-${token.slice(0, 6)}.jpg`,
        });
      });
    }

    // Download sequentially to avoid mobile pop-up blockers
    for (let i = 0; i < queue.length; i++) {
      handleDownload(queue[i].url, queue[i].name);
      await new Promise((r) => setTimeout(r, 450));
    }

    setIsDownloadingAll(false);
  };

  const totalFilesCount =
    (strips ? 2 : 0) + (data?.compositeImage ? 1 : 0) + (data?.shots?.length || 0);

  return (
    <div
      className="min-h-screen w-full bg-zinc-50 px-4 py-8 pb-24 text-zinc-900 flex flex-col items-center font-sans overflow-y-auto selection:bg-zinc-200"
      style={{ WebkitOverflowScrolling: "touch", userSelect: "text" }}
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6 max-w-md w-full">
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200 mb-3">
          <Camera className="h-3.5 w-3.5 text-zinc-600" />
          <span>KioskSnap Photobooth</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Unduh Foto Anda
        </h1>
        <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
          Simpan hasil strip foto mandiri, lembar cetak utuh 4R, dan seluruh pose foto asli resolusi tinggi langsung ke galeri ponsel Anda.
        </p>

        {data && totalFilesCount > 0 && (
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={isDownloadingAll}
            className="mt-4 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 font-semibold text-xs text-white shadow-sm transition active:scale-98 hover:bg-zinc-800 disabled:opacity-60 cursor-pointer"
          >
            {isDownloadingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Mengunduh Berkas...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-white" />
                <span>Unduh Semua Sekaligus ({totalFilesCount} Berkas)</span>
              </>
            )}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-6 w-6 text-zinc-900 animate-spin" />
          <span className="text-xs font-medium text-zinc-600">Mengambil foto Anda...</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
          <span className="text-xs text-zinc-600">
            Pastikan tautan QR Code yang dipindai sudah benar.
          </span>
        </div>
      )}

      {data && (
        <div className="flex flex-col items-center w-full max-w-lg gap-6">
          {/* SECTION 1: INDIVIDUAL STRIPS (TIAP STRIP MANDIRI) */}
          {strips && (
            <div className="flex flex-col w-full rounded-2xl bg-white p-4 border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">Strip Foto Mandiri</h2>
                    <p className="text-[11px] text-zinc-500">Tiap strip 2×6 inci siap upload atau cetak</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                  2 Strip
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                {/* Strip 1 */}
                <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-2.5 border border-zinc-200">
                  <div className="w-full flex justify-center mb-2 overflow-hidden rounded-lg bg-white p-1 border border-zinc-200 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={strips.strip1}
                      alt="Strip 1 (Kiri)"
                      className="max-h-[280px] w-auto object-contain rounded"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(strips.strip1, `KioskSnap-Strip-1-${token.slice(0, 6)}.png`)
                    }
                    className="flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 text-xs font-semibold text-white shadow-2xs transition active:scale-95 hover:bg-zinc-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh Strip 1</span>
                  </button>
                </div>

                {/* Strip 2 */}
                <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-2.5 border border-zinc-200">
                  <div className="w-full flex justify-center mb-2 overflow-hidden rounded-lg bg-white p-1 border border-zinc-200 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={strips.strip2}
                      alt="Strip 2 (Kanan)"
                      className="max-h-[280px] w-auto object-contain rounded"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(strips.strip2, `KioskSnap-Strip-2-${token.slice(0, 6)}.png`)
                    }
                    className="flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 text-xs font-semibold text-white shadow-2xs transition active:scale-95 hover:bg-zinc-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh Strip 2</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 text-center mt-1">
                Format strip 2×6 inci tegak lurus (300 DPI) siap simpan untuk masing-masing orang.
              </div>
            </div>
          )}

          {/* SECTION 2: FULL COMPOSITE SHEET (LEMBAR UTUH 4R) */}
          <div className="flex flex-col items-center rounded-2xl bg-white p-4 border border-zinc-200 shadow-xs w-full">
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Lembar Utuh 4R Vertikal</h2>
                  <p className="text-[11px] text-zinc-500">1200×1800 px @ 300 DPI (Lengkap dengan garis potong)</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-zinc-100 mb-3 w-full flex justify-center p-2.5 border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.compositeImage}
                alt="Foto Komposit 4R Utuh"
                className="max-h-[50vh] w-auto object-contain rounded-lg shadow-2xs border border-zinc-200"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                handleDownload(data.compositeImage, `KioskSnap-Lembar-4R-${token.slice(0, 6)}.png`)
              }
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 font-semibold text-xs text-white shadow-2xs transition active:scale-98 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Simpan Lembar Utuh 4R (PNG)</span>
            </button>
          </div>

          {/* SECTION 3: INDIVIDUAL SHOTS (FOTO SATUAN TIAP POSE) */}
          {data.shots && data.shots.length > 0 && (
            <div className="w-full rounded-2xl bg-white p-4 border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">Foto Asli Per Pose</h2>
                    <p className="text-[11px] text-zinc-500">Foto mentah langsung dari kamera bilik</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                  {data.shots.length} Pose
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {data.shots.map((s) => (
                  <div
                    key={s.poseIndex}
                    className="flex flex-col items-center rounded-xl bg-zinc-50 p-2 border border-zinc-200 shadow-2xs"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-100 mb-2 border border-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.image}
                        alt={`Pose ${s.poseIndex}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(
                          s.image,
                          `KioskSnap-Pose-${s.poseIndex}-${token.slice(0, 6)}.jpg`
                        )
                      }
                      className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-semibold text-zinc-800 border border-zinc-200 transition active:scale-95 hover:bg-zinc-100 shadow-2xs"
                    >
                      <Download className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Unduh Pose {s.poseIndex}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Timestamp */}
          <div className="text-center text-xs text-zinc-500 mt-2">
            Foto diambil pada: {new Date(data.createdAt).toLocaleString("id-ID")}
            <br />
            KioskSnap • Self-Service Photobooth IMK
          </div>
        </div>
      )}
    </div>
  );
}
