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
  Film,
  Video,
} from "lucide-react";
import { exportStripsFromComposite } from "@/lib/canvas";

interface DownloadPayload {
  compositeImage: string;
  videoMontageUrl?: string | null;
  layoutType: string;
  shots: Array<{ poseIndex: number; image: string; liveVideo?: string | null }>;
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
        name: `Rebooth-Strip-1-${token.slice(0, 6)}.png`,
      });
      queue.push({
        url: strips.strip2,
        name: `Rebooth-Strip-2-${token.slice(0, 6)}.png`,
      });
    }

    // 2. Full composite 4R
    if (data.compositeImage) {
      queue.push({
        url: data.compositeImage,
        name: `Rebooth-Lembar-4R-${token.slice(0, 6)}.png`,
      });
    }

    // 3. Raw shots
    if (data.shots && data.shots.length > 0) {
      data.shots.forEach((s) => {
        queue.push({
          url: s.image,
          name: `Rebooth-Pose-${s.poseIndex}-${token.slice(0, 6)}.jpg`,
        });
        if (s.liveVideo) {
          queue.push({
            url: s.liveVideo,
            name: `Rebooth-Live-Pose-${s.poseIndex}-${token.slice(0, 6)}.mp4`,
          });
        }
      });
    }

    // 4. Animated video montage (MP4)
    if (data.videoMontageUrl) {
      queue.push({
        url: data.videoMontageUrl,
        name: `Rebooth-Animasi-Live-${token.slice(0, 6)}.mp4`,
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
    (strips ? 2 : 0) +
    (data?.compositeImage ? 1 : 0) +
    (data?.videoMontageUrl ? 1 : 0) +
    (data?.shots?.length || 0) +
    (data?.shots?.filter((s) => Boolean(s.liveVideo))?.length || 0);

  return (
    <div
      className="min-h-screen w-full studio-bg px-4 py-8 pb-24 text-zinc-900 flex flex-col items-center font-sans overflow-y-auto selection:bg-zinc-200"
      style={{ WebkitOverflowScrolling: "touch", userSelect: "text" }}
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6 max-w-md w-full">
        <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200 mb-3 shadow-xs">
          <Camera className="h-3.5 w-3.5 text-zinc-800" />
          <span>Rebooth Studio</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Unduh Foto dan Video
        </h1>
        <p className="text-xs text-zinc-600 font-normal mt-1.5 leading-relaxed">
          Simpan hasil strip foto mandiri, lembar cetak utuh 4R, dan seluruh Live Photo video resolusi tinggi langsung ke galeri smartphone.
        </p>

        {data && totalFilesCount > 0 && (
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={isDownloadingAll}
            className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] text-xs font-semibold text-white shadow-xs tap-bounce hover:bg-black disabled:opacity-60 cursor-pointer"
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
          <Loader2 className="h-7 w-7 text-zinc-800 animate-spin" />
          <span className="text-xs font-semibold text-zinc-700">Menyiapkan berkas foto Anda...</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-bold text-red-700">{errorMsg}</p>
          <span className="text-xs text-zinc-500 font-normal">
            Pastikan tautan QR Code yang dipindai sudah benar.
          </span>
        </div>
      )}

      {data && (
        <div className="flex flex-col items-center w-full max-w-lg gap-5">
          {/* SECTION 1: INDIVIDUAL STRIPS (TIAP STRIP MANDIRI) */}
          {strips && (
            <div className="flex flex-col w-full rounded-2xl bg-white p-5 border border-zinc-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">Strip Foto Mandiri</h2>
                    <p className="text-[11px] text-zinc-500 font-normal">Tiap strip 2×6 inci siap posting ke media sosial</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md border border-zinc-200">
                  2 Strip
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                {/* Strip 1 */}
                <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                  <div className="w-full flex justify-center mb-2 overflow-hidden rounded-lg bg-white p-1 border border-zinc-200 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={strips.strip1}
                      alt="Strip 1 (Kiri)"
                      className="max-h-[280px] w-auto object-contain rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(strips.strip1, `Rebooth-Strip-1-${token.slice(0, 6)}.png`)
                    }
                    className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#1d1d1f] text-xs font-semibold text-white shadow-xs tap-bounce hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh Strip 1</span>
                  </button>
                </div>

                {/* Strip 2 */}
                <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                  <div className="w-full flex justify-center mb-2 overflow-hidden rounded-lg bg-white p-1 border border-zinc-200 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={strips.strip2}
                      alt="Strip 2 (Kanan)"
                      className="max-h-[280px] w-auto object-contain rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(strips.strip2, `Rebooth-Strip-2-${token.slice(0, 6)}.png`)
                    }
                    className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#1d1d1f] text-xs font-semibold text-white shadow-xs tap-bounce hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh Strip 2</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 text-center mt-1 font-normal">
                Format strip 2×6 inci tegak lurus (300 DPI) siap simpan untuk masing-masing orang.
              </div>
            </div>
          )}

          {/* SECTION 2: ANIMATED LIVE PHOTO MONTAGE (MP4) */}
          {data.videoMontageUrl && (
            <div className="flex flex-col items-center rounded-2xl bg-white p-5 border border-zinc-200/80 shadow-xs w-full">
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
                    <Film className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">Animasi Live Photo (MP4)</h2>
                    <p className="text-[11px] text-zinc-500 font-normal">Video gerak berulang ala Live Photo untuk story</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md border border-zinc-200">
                  Looping MP4
                </span>
              </div>

              <div className="overflow-hidden rounded-xl bg-zinc-950 mb-3 w-full flex justify-center p-1.5 border border-zinc-200">
                <video
                  src={data.videoMontageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="max-h-[340px] w-auto object-contain rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  handleDownload(
                    data.videoMontageUrl!,
                    `Rebooth-Animasi-Live-${token.slice(0, 6)}.mp4`
                  )
                }
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#1d1d1f] font-semibold text-xs text-white shadow-xs tap-bounce hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Animasi Live Photo (MP4)</span>
              </button>
            </div>
          )}

          {/* SECTION 3: FULL COMPOSITE SHEET (LEMBAR UTUH 4R) */}
          <div className="flex flex-col items-center rounded-2xl bg-white p-5 border border-zinc-200/80 shadow-xs w-full">
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Lembar Utuh 4R Vertikal</h2>
                  <p className="text-[11px] text-zinc-500 font-normal">1200×1800 px @ 300 DPI (Lengkap dengan garis potong)</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-zinc-50 mb-3 w-full flex justify-center p-3 border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.compositeImage}
                alt="Foto Komposit 4R Utuh"
                className="max-h-[50vh] w-auto object-contain rounded-lg shadow-xs border border-zinc-200"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                handleDownload(data.compositeImage, `Rebooth-Lembar-4R-${token.slice(0, 6)}.png`)
              }
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#1d1d1f] font-semibold text-xs text-white shadow-xs tap-bounce hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Simpan Lembar Utuh 4R (PNG)</span>
            </button>
          </div>

          {/* SECTION 4: INDIVIDUAL SHOTS (FOTO SATUAN TIAP POSE) */}
          {data.shots && data.shots.length > 0 && (
            <div className="w-full rounded-2xl bg-white p-5 border border-zinc-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">Foto & Live Video Tiap Pose</h2>
                    <p className="text-[11px] text-zinc-500 font-normal">Foto diam dan rekaman video bergerak</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md border border-zinc-200">
                  {data.shots.length} Pose
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {data.shots.map((s) => (
                  <div
                    key={s.poseIndex}
                    className="flex flex-col items-center rounded-xl bg-zinc-50 p-2.5 border border-zinc-200 shadow-2xs"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-white mb-2 border border-zinc-200 relative group">
                      {s.liveVideo ? (
                        <video
                          src={s.liveVideo}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={s.image}
                          alt={`Pose ${s.poseIndex}`}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {s.liveVideo && (
                        <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                          LIVE
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col w-full gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            s.image,
                            `Rebooth-Pose-${s.poseIndex}-${token.slice(0, 6)}.jpg`
                          )
                        }
                        className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-white text-[11px] font-semibold text-zinc-800 border border-zinc-200 transition tap-bounce hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 shadow-2xs cursor-pointer"
                      >
                        <Download className="h-3 w-3 text-zinc-700" />
                        <span>Foto Pose {s.poseIndex}</span>
                      </button>

                      {s.liveVideo && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              s.liveVideo!,
                              `Rebooth-Live-Pose-${s.poseIndex}-${token.slice(0, 6)}.mp4`
                            )
                          }
                          className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-[11px] font-semibold text-zinc-800 border border-zinc-200 transition tap-bounce hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 shadow-2xs cursor-pointer"
                        >
                          <Video className="h-3 w-3 text-zinc-700" />
                          <span>Video Pose {s.poseIndex}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Timestamp */}
          <div className="text-center text-xs text-zinc-500 mt-2 font-medium">
            Foto diambil pada: {new Date(data.createdAt).toLocaleString("id-ID")}
            <br />
            Rebooth • Self-Service Photobooth IMK
          </div>
        </div>
      )}
    </div>
  );
}
