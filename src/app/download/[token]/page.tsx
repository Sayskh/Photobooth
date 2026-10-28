"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Camera, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";

interface DownloadPayload {
  compositeImage: string;
  shots: Array<{ poseIndex: number; image: string }>;
  createdAt: string;
}

export default function DownloadPage() {
  const params = useParams();
  const token = params?.token as string;

  const [data, setData] = useState<DownloadPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/download/${token}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
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

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 py-8 text-zinc-900 flex flex-col items-center font-sans">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200 mb-3">
          <Camera className="h-3.5 w-3.5 text-zinc-600" />
          <span>KioskSnap Photobooth</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">Unduh Foto Anda</h1>
        <p className="text-xs text-zinc-600 mt-1 max-w-sm">
          Simpan hasil cetak komposit dan seluruh pose foto ke galeri smartphone Anda tanpa watermark.
        </p>
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
        <div className="flex flex-col items-center w-full max-w-md gap-5">
          {/* Main Composite Image Card */}
          <div className="flex flex-col items-center rounded-2xl bg-white p-4 border border-zinc-200 shadow-sm w-full">
            <div className="overflow-hidden rounded-xl bg-zinc-100 mb-4 w-full flex justify-center p-2 border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.compositeImage}
                alt="Foto Komposit"
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-2xs border border-zinc-200"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                handleDownload(data.compositeImage, `KioskSnap-Frame-${token.slice(0, 6)}.png`)
              }
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 font-semibold text-xs text-white shadow-xs transition active:scale-98 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            >
              <Download className="h-4 w-4" />
              <span>Simpan Foto Frame Lengkap (PNG)</span>
            </button>
          </div>

          {/* Individual Shots Section */}
          {data.shots && data.shots.length > 0 && (
            <div className="w-full">
              <h3 className="text-xs font-bold text-zinc-800 mb-2.5 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-zinc-600" />
                <span>Foto Satuan Per Pose</span>
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {data.shots.map((s) => (
                  <div
                    key={s.poseIndex}
                    className="flex flex-col items-center rounded-xl bg-white p-2.5 border border-zinc-200 shadow-2xs"
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
                      className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md bg-zinc-100 text-xs font-semibold text-zinc-800 border border-zinc-200 transition active:scale-95 hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Unduh Pose {s.poseIndex}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center text-xs text-zinc-600 mt-2">
            Foto diambil pada: {new Date(data.createdAt).toLocaleString("id-ID")}
            <br />
            KioskSnap • Proyek IMK Semester 3
          </div>
        </div>
      )}
    </div>
  );
}
