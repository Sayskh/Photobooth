"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { sounds } from "@/lib/sound";

interface CameraCaptureScreenProps {
  slotsCount: number;
  sessionSecondsLeft: number;
  cameraDeviceId?: string | null;
  onAllPhotosCaptured: (photos: string[]) => void;
  onTimeExpired?: () => void;
}

export function CameraCaptureScreen({
  slotsCount,
  sessionSecondsLeft,
  cameraDeviceId,
  onAllPhotosCaptured,
}: CameraCaptureScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const isAllCaptured = capturedPhotos.length === slotsCount && retakeIndex === null;
  const currentPose = retakeIndex !== null ? retakeIndex + 1 : capturedPhotos.length + 1;

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const videoConstraints: MediaTrackConstraints = {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          ...(cameraDeviceId ? { deviceId: { exact: cameraDeviceId } } : { facingMode: "user" }),
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError(
          "Kamera tidak terdeteksi atau izin ditolak. Hubungi staf bilik atau periksa kabel webcam."
        );
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [cameraDeviceId]);

  // Capture frame to base64
  const captureFrame = (): string => {
    if (!videoRef.current) return "";
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Mirroring horizontal to match kiosk screen mirror view
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.95);
  };

  const triggerPoseSequence = () => {
    if (countdown !== null) return;
    setCountdown(3);
    sounds.playTick();
  };

  // Keyboard shortcut: Spacebar triggers shutter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isAllCaptured && countdown === null) {
        e.preventDefault();
        triggerPoseSequence();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAllCaptured, countdown]);

  const handleRetakeSpecificPose = (index: number) => {
    sounds.playClick();
    setRetakeIndex(index);
  };

  const handleRetakeLastPose = () => {
    if (capturedPhotos.length === 0 || countdown !== null) return;
    sounds.playClick();
    setCapturedPhotos((prev) => prev.slice(0, -1));
    setRetakeIndex(null);
  };

  const handleRetakeAll = () => {
    if (countdown !== null) return;
    sounds.playClick();
    setCapturedPhotos([]);
    setRetakeIndex(null);
  };

  const handleConfirmAndProceed = () => {
    sounds.playSuccess();
    onAllPhotosCaptured(capturedPhotos);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 1) {
      const timer = setTimeout(() => {
        sounds.playTick();
        setCountdown((c) => (c ? c - 1 : 1));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 1) {
      const timer = setTimeout(() => {
        sounds.playShutter();
        setIsFlashing(true);
        const photo = captureFrame();

        setTimeout(() => {
          setIsFlashing(false);
        }, 150);

        if (photo) {
          if (retakeIndex !== null) {
            setCapturedPhotos((prev) => {
              const updated = [...prev];
              updated[retakeIndex] = photo;
              return updated;
            });
            setRetakeIndex(null);
          } else {
            setCapturedPhotos((prev) => [...prev, photo]);
          }
        }

        setCountdown(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, retakeIndex]);

  // Strip-aware guidance helper
  const getStripTitle = (poseNumber: number) => {
    if (slotsCount === 6) {
      if (poseNumber <= 3) {
        return `Strip 1 • Pose ${poseNumber} dari 3`;
      }
      return `Strip 2 • Pose ${poseNumber - 3} dari 3 (Pose ke-${poseNumber} Total)`;
    }
    if (slotsCount === 4) {
      if (poseNumber <= 2) {
        return `Kartu 1 • Pose ${poseNumber} dari 2`;
      }
      return `Kartu 2 • Pose ${poseNumber - 2} dari 2 (Pose ke-${poseNumber} Total)`;
    }
    return `Pose ${poseNumber} dari ${slotsCount}`;
  };

  const getSubPoseGuidance = (poseNumber: number) => {
    if (slotsCount === 6) {
      if (poseNumber === 1) return "Pose senyum terbaikmu untuk strip pertama";
      if (poseNumber === 2) return "Gaya candid atau pose manis bersama teman";
      if (poseNumber === 3) return "Pose bebas penutup untuk lembar Strip 1";
      if (poseNumber === 4) return "Mulai pose baru untuk lembar Strip 2!";
      if (poseNumber === 5) return "Pose lucu, ekspresif, atau gaya andalan";
      if (poseNumber === 6) return "Jepretan terakhir untuk lembar Strip 2";
    }
    return `Ambil jepretan pose ke-${poseNumber}`;
  };

  const mins = Math.floor(sessionSecondsLeft / 60);
  const secs = sessionSecondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-between bg-zinc-100 p-5 select-none overflow-hidden font-sans text-zinc-900">
      {/* Top Status Bar */}
      <div className="z-10 flex w-full max-w-5xl items-center justify-between rounded-xl bg-white px-5 py-3 border border-zinc-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-2xs">
            <Camera className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-sm md:text-base font-bold text-zinc-900 block leading-tight">
              {isAllCaptured
                ? "Semua Pose Lengkap (Review & Lanjut)"
                : getStripTitle(currentPose)}
            </span>
            {!isAllCaptured && (
              <span className="text-[11px] font-medium text-zinc-500 block">
                {getSubPoseGuidance(currentPose)}
              </span>
            )}
          </div>
        </div>

        {/* Global Session Timer */}
        <div
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold border transition ${
            sessionSecondsLeft <= 60
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-zinc-100 text-zinc-800 border-zinc-200"
          }`}
        >
          <Clock className={`h-3.5 w-3.5 ${sessionSecondsLeft <= 60 ? "text-red-600" : "text-zinc-600"}`} />
          <span>Sisa Waktu: {timeFormatted}</span>
        </div>

        {/* Visual Pose Progression Tracker */}
        <div className="hidden sm:flex items-center gap-2" aria-label="Status progres pose">
          {slotsCount === 6 ? (
            <div className="flex items-center gap-3">
              {/* Strip 1 Group */}
              <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200">
                <span className="text-[9px] font-mono font-bold text-zinc-500 mr-1 uppercase">S1</span>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-5 rounded-full transition-all ${
                      i < capturedPhotos.length
                        ? "bg-zinc-900"
                        : i + 1 === currentPose
                        ? "bg-red-600 ring-2 ring-red-300"
                        : "bg-zinc-300"
                    }`}
                  />
                ))}
              </div>

              {/* Strip 2 Group */}
              <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200">
                <span className="text-[9px] font-mono font-bold text-zinc-500 mr-1 uppercase">S2</span>
                {[3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-5 rounded-full transition-all ${
                      i < capturedPhotos.length
                        ? "bg-zinc-900"
                        : i + 1 === currentPose
                        ? "bg-red-600 ring-2 ring-red-300"
                        : "bg-zinc-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: slotsCount }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-6 rounded-full transition-all ${
                    i < capturedPhotos.length
                      ? "bg-zinc-900"
                      : i + 1 === currentPose
                      ? "bg-red-600 ring-2 ring-red-300"
                      : "bg-zinc-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Center Stage: Live Webcam Feed OR Review Grid */}
      {isAllCaptured ? (
        <div className="relative flex flex-1 flex-col items-center justify-between my-2.5 w-full max-w-5xl rounded-2xl bg-white p-5 border border-zinc-200/90 shadow-sm overflow-hidden">
          <div className="text-center mb-2">
            <h3 className="text-lg font-bold text-zinc-900">
              Periksa Hasil Foto Anda
            </h3>
            <p className="text-xs text-zinc-600">
              Ketuk tombol ulang pada foto jika ingin mengganti pose tertentu, atau tekan tombol lanjut untuk menghias foto.
            </p>
          </div>

          {/* Grouped Strip Result Cards */}
          <div className="w-full max-w-4xl flex-1 overflow-y-auto px-2 py-1 space-y-4">
            {slotsCount === 6 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* STRIP 1 CARD GROUP */}
                <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-200">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Lembar Cetak Strip 1
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Pose 1 - 3</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center rounded-lg bg-white p-1.5 border border-zinc-200 shadow-2xs"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden rounded bg-zinc-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={capturedPhotos[idx]}
                            alt={`Pose ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-800 mt-1">
                          Foto {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRetakeSpecificPose(idx)}
                          className="mt-1 flex min-h-[36px] w-full items-center justify-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Ulang</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STRIP 2 CARD GROUP */}
                <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-200">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Lembar Cetak Strip 2 (Pose Beda)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Pose 4 - 6</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center rounded-lg bg-white p-1.5 border border-zinc-200 shadow-2xs"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden rounded bg-zinc-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={capturedPhotos[idx]}
                            alt={`Pose ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-800 mt-1">
                          Foto {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRetakeSpecificPose(idx)}
                          className="mt-1 flex min-h-[36px] w-full items-center justify-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Ulang</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`grid gap-3 ${
                  slotsCount === 1
                    ? "grid-cols-1 max-w-sm mx-auto"
                    : slotsCount === 2
                    ? "grid-cols-2 max-w-lg mx-auto"
                    : slotsCount === 3
                    ? "grid-cols-3 max-w-2xl mx-auto"
                    : "grid-cols-2 md:grid-cols-4"
                }`}
              >
                {capturedPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center rounded-xl bg-zinc-50 p-2.5 border border-zinc-200 shadow-2xs"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`Pose ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-2 flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800">Pose {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRetakeSpecificPose(idx)}
                        className="flex min-h-[38px] items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-3 rounded-md border border-red-200 transition active:scale-95 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Ulang</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* LIVE VIEWPORT CONTAINER */
        <div className="relative flex flex-1 w-full max-w-5xl items-center justify-center my-2 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-300 shadow-md">
          {cameraError ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-red-300">
              <AlertTriangle className="h-10 w-10 text-red-400" />
              <p className="max-w-md font-medium text-white text-sm">{cameraError}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          )}

          {/* Flash Shutter Overlay */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white transition-opacity duration-100 z-30 pointer-events-none" />
          )}

          {/* Dynamic Studio Countdown Ring */}
          {countdown !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 z-20 backdrop-blur-xs">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-white/90 bg-zinc-950/70 shadow-2xl">
                <span className="font-mono text-7xl font-black text-white">
                  {countdown}
                </span>
              </div>
              <span className="mt-4 text-sm font-bold tracking-wider text-white uppercase drop-shadow-md">
                Tatap Kamera & Tahan Senyum!
              </span>
            </div>
          )}

          {/* Retake Mode Badge */}
          {retakeIndex !== null && countdown === null && (
            <div className="absolute top-4 left-4 z-20 rounded-lg bg-zinc-900/90 px-3.5 py-2 text-xs text-white font-bold backdrop-blur-sm flex items-center gap-2 border border-white/20 shadow-lg">
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Mode Jepret Ulang: Pose {retakeIndex + 1}</span>
            </div>
          )}

          {/* Bottom Live Thumbnails Shelf */}
          {capturedPhotos.length > 0 && (
            <div className="absolute bottom-4 left-4 z-20 flex gap-2 overflow-x-auto max-w-[70%] p-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              {capturedPhotos.map((shot, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleRetakeSpecificPose(idx)}
                  className={`relative h-14 w-20 overflow-hidden rounded-lg border-2 shadow-sm bg-zinc-800 cursor-pointer transition hover:scale-105 active:scale-95 focus-visible:outline-none shrink-0 ${
                    retakeIndex === idx
                      ? "border-amber-400 ring-2 ring-amber-300"
                      : "border-white/80"
                  }`}
                  aria-label={`Ulang Pose ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot}
                    alt={`Pose ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-bold text-white bg-black/70 px-1 rounded">
                    {slotsCount === 6 ? (idx < 3 ? `S1-${idx + 1}` : `S2-${idx - 2}`) : `#${idx + 1}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOTTOM TOUCH CONTROL BAR */}
      <div className="z-10 flex w-full max-w-2xl items-center justify-center gap-4 pt-1">
        {isAllCaptured ? (
          <div className="flex w-full items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRetakeAll}
              className="flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-bold text-zinc-700 border border-zinc-200 shadow-2xs transition active:scale-95 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Mulai Ulang Semua</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAndProceed}
              className="flex min-h-[52px] flex-1 max-w-md items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-md transition active:scale-[0.98] hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Hasil Sudah Pas, Lanjut Hias Foto</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 w-full">
            {/* Retake / Cancel Button */}
            {retakeIndex !== null && countdown === null ? (
              <button
                type="button"
                onClick={() => setRetakeIndex(null)}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-zinc-700 border border-zinc-200 shadow-2xs transition active:scale-95 hover:bg-zinc-100 cursor-pointer"
              >
                <span>Batal Ulang Pose {retakeIndex + 1}</span>
              </button>
            ) : (
              capturedPhotos.length > 0 &&
              countdown === null && (
                <button
                  type="button"
                  onClick={handleRetakeLastPose}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-zinc-700 border border-zinc-200 shadow-2xs transition active:scale-95 hover:bg-zinc-100 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Ulang Pose {capturedPhotos.length}</span>
                </button>
              )
            )}

            {/* AUTHENTIC STUDIO SHUTTER TRIGGER BAR */}
            {countdown === null ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={triggerPoseSequence}
                  aria-label="Ambil Foto Shutter"
                  className="flex min-h-[58px] items-center gap-3.5 rounded-full bg-zinc-900 px-8 text-white border border-zinc-700 shadow-md transition active:scale-[0.97] hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
                >
                  {/* Concentric Mechanical Shutter Iris Indicator */}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-400 bg-zinc-800">
                    <div className="h-2.5 w-2.5 rounded-full bg-white shadow-xs" />
                  </div>

                  <span className="text-sm font-bold tracking-wider uppercase">
                    {retakeIndex !== null
                      ? `Jepret Ulang Pose ${retakeIndex + 1}`
                      : `Ambil Pose ${currentPose}`}
                  </span>

                  <kbd className="hidden sm:inline-block rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-300 border border-zinc-700">
                    SPASI
                  </kbd>
                </button>
              </div>
            ) : (
              <div className="flex min-h-[58px] items-center justify-center gap-3 rounded-full bg-white px-7 border border-zinc-200 text-zinc-800 shadow-2xs font-semibold text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-900" />
                <span>Bersiap untuk pose {retakeIndex !== null ? retakeIndex + 1 : currentPose}...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
