"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
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
  onAllPhotosCaptured: (photos: string[], liveVideos?: string[]) => void;
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
  const [liveVideos, setLiveVideos] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [reviewingPhoto, setReviewingPhoto] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const currentPose = capturedPhotos.length + 1;

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      setCameraError(null);
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
          videoRef.current.play().catch(() => {});
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
  }, [cameraDeviceId, retryTrigger]);

  // Keep camera stream attached to video element if it ever detaches
  useEffect(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [reviewingPhoto]);

  // Capture frame to base64
  const captureFrame = (): string => {
    if (!videoRef.current) return "";
    const video = videoRef.current;

    // Ensure stream is attached before capturing
    if (streamRef.current && video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current;
    }

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
    if (countdown !== null || reviewingPhoto !== null) return;
    setCountdown(3);
    sounds.playTick();

    // Start recording Live Photo clip (2-3 seconds before shutter)
    if (typeof window !== "undefined" && window.MediaRecorder && streamRef.current) {
      try {
        recordedChunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported("video/mp4")
          ? "video/mp4"
          : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm";

        const rec = new MediaRecorder(streamRef.current, { mimeType });
        rec.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        rec.start(100);
        mediaRecorderRef.current = rec;
      } catch (err) {
        console.warn("Live photo recording error:", err);
      }
    }
  };

  // Keyboard shortcut: Spacebar triggers shutter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && reviewingPhoto === null && countdown === null) {
        e.preventDefault();
        triggerPoseSequence();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reviewingPhoto, countdown]);

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

        // Stop live photo recording and convert to dataUrl
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          const currentRec = mediaRecorderRef.current;
          currentRec.onstop = () => {
            const mimeType = currentRec.mimeType || "video/webm";
            const blob = new Blob(recordedChunksRef.current, { type: mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === "string") {
                setLiveVideos((prev) => [...prev, reader.result as string]);
              }
            };
            reader.readAsDataURL(blob);
          };
          currentRec.stop();
        }

        if (photo) {
          setCapturedPhotos((prev) => [...prev, photo]);
          setReviewingPhoto(photo);
        }

        setCountdown(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const mins = Math.floor(sessionSecondsLeft / 60);
  const secs = sessionSecondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const statusText = reviewingPhoto
    ? `Review Pose ${capturedPhotos.length} dari ${slotsCount}`
    : `Pose ${currentPose} dari ${slotsCount}`;

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-between studio-bg p-3 md:p-5 select-none overflow-hidden font-sans text-zinc-900">
      {/* Top Status Bar */}
      <div className="z-10 flex w-full max-w-5xl items-center justify-between rounded-2xl bg-white px-5 py-3 border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1d1d1f] text-white shadow-xs">
            <Camera className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-sm md:text-base font-bold text-zinc-900 block leading-tight">
              {statusText}
            </span>
            <span className="text-[11px] font-normal text-zinc-500 block">
              {reviewingPhoto
                ? "Periksa pose Anda sebelum lanjut"
                : "Bersiap di depan kamera"}
            </span>
          </div>
        </div>

        {/* Global Session Timer */}
        <div
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 font-mono text-xs font-semibold border transition ${
            sessionSecondsLeft <= 60
              ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
              : "bg-zinc-100 text-zinc-800 border-zinc-200"
          }`}
        >
          <Clock className={`h-3.5 w-3.5 ${sessionSecondsLeft <= 60 ? "text-red-500" : "text-zinc-600"}`} />
          <span>Sisa Waktu: {timeFormatted}</span>
        </div>

        {/* Visual Pose Progression Tracker */}
        <div className="hidden sm:flex items-center gap-2" aria-label="Status progres pose">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: slotsCount }).map((_, i) => (
              <div
                key={i}
                className={`h-2.5 w-6 rounded-md transition-all ${
                  i < capturedPhotos.length
                    ? "bg-[#1d1d1f]"
                    : i + 1 === currentPose
                    ? "bg-zinc-500 ring-2 ring-zinc-300"
                    : "bg-zinc-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Center Stage: Live Webcam Feed OR Frozen Review */}
      <div className="relative flex flex-1 w-full max-w-5xl items-center justify-center my-2 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-300 shadow-sm">
        {cameraError ? (
          <div className="flex flex-col items-center gap-3 p-6 text-center text-red-300">
            <AlertTriangle className="h-10 w-10 text-red-400" />
            <p className="max-w-md font-medium text-white text-sm">{cameraError}</p>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setRetryTrigger((prev) => prev + 1);
              }}
              className="mt-2 flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-semibold text-zinc-900 shadow-sm tap-bounce hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-zinc-900" />
              <span>Coba Hubungkan Ulang Kamera</span>
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${reviewingPhoto !== null ? "hidden" : "block"}`}
            style={{ transform: "scaleX(-1)" }}
          />
        )}

        {/* Frozen Review Preview Overlay */}
        {reviewingPhoto !== null && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={reviewingPhoto}
            alt={`Review Pose ${capturedPhotos.length}`}
            className="absolute inset-0 h-full w-full object-cover z-10"
          />
        )}

        {/* Flash Shutter Overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white transition-opacity duration-100 z-30 pointer-events-none" />
        )}

        {/* Dynamic Studio Countdown Ring */}
        {countdown !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20 backdrop-blur-xs">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/80 bg-black/60 shadow-xl">
              <span className="font-mono text-6xl font-bold text-white">
                {countdown}
              </span>
            </div>
            <span className="mt-4 text-xs font-semibold tracking-wider text-white uppercase drop-shadow-sm">
              Tatap Kamera & Bersiap!
            </span>
          </div>
        )}

        {/* Bottom Live Thumbnails Shelf */}
        {capturedPhotos.length > 0 && reviewingPhoto === null && (
          <div className="absolute bottom-4 left-4 z-20 flex gap-2 overflow-x-auto max-w-[70%] p-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20">
            {capturedPhotos.map((shot, idx) => (
              <div
                key={idx}
                className="relative h-14 w-20 overflow-hidden rounded-lg border border-white/80 shadow-xs bg-zinc-800 shrink-0"
                aria-label={`Pose ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot}
                  alt={`Pose ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-bold text-white bg-black/80 px-1 rounded">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM TOUCH CONTROL BAR */}
      <div className="z-10 flex w-full max-w-2xl items-center justify-center gap-4 pt-1">
        {reviewingPhoto !== null ? (
          <div className="flex w-full items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setCapturedPhotos((prev) => prev.slice(0, -1));
                setLiveVideos((prev) => prev.slice(0, -1));
                setReviewingPhoto(null);
              }}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-zinc-700 border border-zinc-200 shadow-xs tap-bounce hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-zinc-600" />
              <span>Ulangi Pose {capturedPhotos.length}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setReviewingPhoto(null);
                if (capturedPhotos.length >= slotsCount) {
                  sounds.playSuccess();
                  onAllPhotosCaptured(capturedPhotos, liveVideos);
                }
              }}
              className="flex min-h-[48px] flex-1 max-w-md items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] text-xs font-semibold text-white shadow-xs tap-bounce hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {capturedPhotos.length >= slotsCount
                  ? "Hasil Sudah Pas, Lanjut Hias Foto"
                  : `Lanjut ke Pose ${capturedPhotos.length + 1}`}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 w-full">
            {capturedPhotos.length > 0 && countdown === null && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCapturedPhotos((prev) => prev.slice(0, -1));
                }}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-zinc-700 border border-zinc-200 shadow-xs tap-bounce hover:bg-zinc-50 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-zinc-600" />
                <span>Ulang Pose {capturedPhotos.length}</span>
              </button>
            )}

            {/* AUTHENTIC STUDIO SHUTTER TRIGGER BAR */}
            {countdown === null ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={triggerPoseSequence}
                  aria-label="Ambil Foto Shutter"
                  className="flex min-h-[56px] items-center gap-3 rounded-2xl bg-[#1d1d1f] px-8 text-white shadow-xs tap-bounce hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/80 bg-white/10">
                    <div className="h-3 w-3 rounded-full bg-[#ff3b30]" />
                  </div>

                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Ambil Pose {currentPose}
                  </span>

                  <kbd className="hidden sm:inline-block rounded-md bg-white/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-white border border-white/20">
                    SPASI
                  </kbd>
                </button>
              </div>
            ) : (
              <div className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-white px-6 border border-zinc-200 text-zinc-800 shadow-xs font-semibold text-xs">
                <div className="h-2 w-2 rounded-full bg-[#ff3b30] animate-ping" />
                <span>Bersiap untuk pose {currentPose}...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
