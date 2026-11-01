"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { AttractScreen } from "@/components/AttractScreen";
import { PaymentScreen } from "@/components/PaymentScreen";
import { FrameSelectScreen, TemplateChoice } from "@/components/FrameSelectScreen";
import { CameraCaptureScreen } from "@/components/CameraCaptureScreen";
import { CanvasCustomizerScreen } from "@/components/CanvasCustomizerScreen";
import { PrintOutputScreen } from "@/components/PrintOutputScreen";
import { AdminModal } from "@/components/AdminModal";
import { StickerItem, renderCompositeCanvas } from "@/lib/canvas";
import { createLivePhotoMontage } from "@/lib/videoMontage";

type KioskStep =
  | "IDLE"
  | "PAYMENT"
  | "FRAME_SELECT"
  | "CAPTURE"
  | "CUSTOMIZE"
  | "PRINT_OUTPUT";

interface BoothConfig {
  name: string;
  storeName: string;
  price: number;
  includedPrints: number;
  sessionTimeout: number;
  watermarkText: string;
  cameraDeviceId: string | null;
}

const DEFAULT_BOOTH_CONFIG: BoothConfig = {
  name: "Booth Utama",
  storeName: "Rebooth Studio",
  price: 30000,
  includedPrints: 2,
  sessionTimeout: 480,
  watermarkText: "Rebooth • Photobooth",
  cameraDeviceId: null,
};

export default function PhotoboothKiosk() {
  const [currentStep, setCurrentStep] = useState<KioskStep>("IDLE");
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [boothConfig, setBoothConfig] = useState<BoothConfig>(DEFAULT_BOOTH_CONFIG);

  // Session Data
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(DEFAULT_BOOTH_CONFIG.sessionTimeout);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateChoice | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("THEATER_TICKET");
  const [selectedFrameColor, setSelectedFrameColor] = useState<string>("#FFFFFF");

  const [rawPhotos, setRawPhotos] = useState<string[]>([]);
  const [liveVideos, setLiveVideos] = useState<string[]>([]);
  const [videoMontageUrl, setVideoMontageUrl] = useState<string>("");
  const [finalCompositeImage, setFinalCompositeImage] = useState<string>("");
  const [qrToken, setQrToken] = useState<string>("");
  const [showTimeWarning, setShowTimeWarning] = useState<boolean>(false);

  // Load Booth Configuration
  const loadBoothConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/booth");
      if (!res.ok) throw new Error(`booth fetch ${res.status}`);
      const text = await res.text();
      if (!text) throw new Error("booth response empty");
      const data = JSON.parse(text);
      if (data.success && data.booth) {
        setBoothConfig({
          name: data.booth.name || "Booth Utama",
          storeName: data.booth.storeName || "Rebooth Studio",
          price: Number(data.booth.price) || 30000,
          includedPrints: Number(data.booth.includedPrints) || 2,
          sessionTimeout: Number(data.booth.sessionTimeout) || 480,
          watermarkText: data.booth.watermarkText || "Rebooth • Photobooth",
          cameraDeviceId: data.booth.cameraDeviceId || null,
        });
      }
    } catch (err) {
      console.error("Failed to fetch booth config:", err);
    }
  }, []);

  useEffect(() => {
    loadBoothConfig();
  }, [loadBoothConfig]);

  // Reset to initial Idle state
  const handleReset = useCallback(() => {
    setSessionId("");
    setSessionSecondsLeft(boothConfig.sessionTimeout);
    setSelectedTemplate(null);
    setSelectedThemeId("THEATER_TICKET");
    setSelectedFrameColor("#FFFFFF");
    setRawPhotos([]);
    setLiveVideos([]);
    setVideoMontageUrl("");
    setFinalCompositeImage("");
    setQrToken("");
    setCurrentStep("IDLE");
  }, [boothConfig.sessionTimeout]);

  // Finish Customization -> Print & QR Output
  const handleFinishCustomization = useCallback(
    async (
      finalDataUrl: string,
      stickers: StickerItem[],
      filter: string,
      frameColor: string
    ) => {
      setFinalCompositeImage(finalDataUrl);

      // Save final composite to backend
      try {
        const res = await fetch(`/api/sessions/${sessionId}/composite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frameTemplateId: selectedTemplate?.id || "template-strip-3",
            filterSelected: filter,
            frameColor,
            stickersData: stickers,
            finalImagePath: finalDataUrl,
            videoMontageUrl: videoMontageUrl || null,
          }),
        });
        if (!res.ok) throw new Error(`composite save ${res.status}`);
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          if (data.success) {
            setQrToken(data.qrDownloadToken);
          }
        }
      } catch (e) {
        console.error("Save composite error:", e);
      }

      setCurrentStep("PRINT_OUTPUT");
    },
    [sessionId, selectedTemplate, videoMontageUrl]
  );

  // Handle session timeout: auto render and finalize
  const handleTimeExpired = useCallback(async () => {
    if (rawPhotos.length > 0 && selectedTemplate) {
      try {
        const autoCanvas = await renderCompositeCanvas({
          layoutType: selectedTemplate.layoutType,
          photos: rawPhotos,
          filter: "NORMAL",
          frameColor: selectedFrameColor,
          themeStyle: selectedThemeId,
          stickers: [],
          watermarkText: boothConfig.watermarkText,
        });
        await handleFinishCustomization(autoCanvas, [], "NORMAL", selectedFrameColor);
      } catch {
        if (rawPhotos[0]) {
          handleFinishCustomization(rawPhotos[0], [], "NORMAL", selectedFrameColor);
        } else {
          handleReset();
        }
      }
    } else {
      // No photos at all - gracefully reset after short delay
      handleReset();
    }
  }, [
    rawPhotos,
    selectedTemplate,
    selectedFrameColor,
    selectedThemeId,
    boothConfig.watermarkText,
    handleFinishCustomization,
    handleReset,
  ]);

  // Global Session Countdown Timer - stable interval, no sessionSecondsLeft dep
  useEffect(() => {
    const isSessionActive =
      sessionId !== "" &&
      (currentStep === "FRAME_SELECT" || currentStep === "CAPTURE" || currentStep === "CUSTOMIZE");
    if (!isSessionActive) return;
    const timer = setInterval(() => {
      setSessionSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId, currentStep]);

  // Warning at 15 seconds
  useEffect(() => {
    if (
      sessionSecondsLeft === 15 &&
      sessionId !== "" &&
      currentStep !== "IDLE" &&
      currentStep !== "PAYMENT" &&
      currentStep !== "PRINT_OUTPUT"
    ) {
      setShowTimeWarning(true);
    }
  }, [sessionSecondsLeft, sessionId, currentStep]);

  // Handle actual timeout
  useEffect(() => {
    if (
      sessionSecondsLeft === 0 &&
      sessionId !== "" &&
      currentStep !== "IDLE" &&
      currentStep !== "PRINT_OUTPUT"
    ) {
      setShowTimeWarning(false);
      handleTimeExpired();
    }
  }, [sessionSecondsLeft, sessionId, currentStep, handleTimeExpired]);

  // 1. From Attract -> Start Payment
  const handleStart = () => {
    setCurrentStep("PAYMENT");
  };

  // 2. From Payment -> Frame Selection (Session timer starts here)
  const handlePaymentSuccess = (newSessionId: string) => {
    setSessionId(newSessionId);
    setSessionSecondsLeft(boothConfig.sessionTimeout);
    setCurrentStep("FRAME_SELECT");
  };

  // 3. From Frame Selection -> Camera (Frame format + theme + color decided here upfront)
  const handleSelectTemplate = (template: TemplateChoice, themeId: string, frameColor: string) => {
    setSelectedTemplate(template);
    setSelectedThemeId(themeId);
    setSelectedFrameColor(frameColor);
    setCurrentStep("CAPTURE");
  };

  // 4. From Camera -> Touch-Up / Customization
  const handleAllPhotosCaptured = async (photos: string[], videos?: string[]) => {
    setRawPhotos(photos);
    const recordedVideos = videos || [];
    setLiveVideos(recordedVideos);

    // Save raw photo shots and live videos to server in background
    if (sessionId) {
      photos.forEach((dataUrl, idx) => {
        fetch(`/api/sessions/${sessionId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            poseIndex: idx + 1,
            dataUrl,
            liveVideoUrl: recordedVideos[idx] || null,
          }),
        }).catch(console.error);
      });
    }

    // Generate live photo animated video montage in background while user customizes
    createLivePhotoMontage(recordedVideos, photos)
      .then((montage) => {
        if (montage) setVideoMontageUrl(montage);
      })
      .catch((err) => console.warn("Live photo montage error:", err));

    setCurrentStep("CUSTOMIZE");
  };

  // 5. From Customizer -> Back to Camera for Retake
  const handleRetakePhotos = () => {
    setRawPhotos([]);
    setLiveVideos([]);
    setCurrentStep("CAPTURE");
  };

  return (
    <main className="h-screen w-screen overflow-hidden">
      {currentStep === "IDLE" && (
        <AttractScreen
          onStart={handleStart}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      )}

      {currentStep === "PAYMENT" && (
        <PaymentScreen
          price={boothConfig.price}
          includedPrints={boothConfig.includedPrints}
          onBack={handleReset}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {currentStep === "FRAME_SELECT" && (
        <FrameSelectScreen
          onBack={() => setCurrentStep("PAYMENT")}
          onSelectTemplate={handleSelectTemplate}
          initialTemplateId={selectedTemplate?.id || "template-strip-3"}
          initialThemeId={selectedThemeId}
          initialFrameColor={selectedFrameColor}
        />
      )}

      {currentStep === "CAPTURE" && selectedTemplate && (
        <CameraCaptureScreen
          slotsCount={selectedTemplate.slotsCount}
          sessionSecondsLeft={sessionSecondsLeft}
          cameraDeviceId={boothConfig.cameraDeviceId}
          onAllPhotosCaptured={handleAllPhotosCaptured}
          onTimeExpired={handleTimeExpired}
        />
      )}

      {currentStep === "CUSTOMIZE" && selectedTemplate && (
        <CanvasCustomizerScreen
          layoutType={selectedTemplate.layoutType}
          photos={rawPhotos}
          sessionSecondsLeft={sessionSecondsLeft}
          watermarkText={boothConfig.watermarkText}
          initialThemeId={selectedThemeId}
          initialFrameColor={selectedFrameColor}
          onFinishCustomization={handleFinishCustomization}
          onRetakePhotos={handleRetakePhotos}
          onTimeExpired={handleTimeExpired}
        />
      )}

      {currentStep === "PRINT_OUTPUT" && (
        <PrintOutputScreen
          sessionId={sessionId}
          finalImage={finalCompositeImage}
          qrToken={qrToken}
          onReset={handleReset}
        />
      )}

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onSettingsSaved={loadBoothConfig}
      />

      {showTimeWarning && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="time-warning-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <div className="flex flex-col items-center gap-3.5 rounded-2xl bg-white p-7 shadow-xl border border-zinc-200 max-w-sm text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
              <Clock className="h-6 w-6" />
            </div>
            <h3 id="time-warning-title" className="text-lg font-bold text-zinc-900">
              Sesi Hampir Selesai
            </h3>
            <p className="text-xs text-zinc-600 font-normal leading-relaxed">
              Tersisa <strong className="text-zinc-900 font-semibold">{sessionSecondsLeft} detik</strong>. Sistem akan melanjutkan otomatis ke proses cetak jika waktu habis.
            </p>
            <div className="flex w-full gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSessionSecondsLeft(prev => prev + 30);
                  setShowTimeWarning(false);
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-800 border border-zinc-200 hover:bg-zinc-200 tap-bounce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
              >
                Tambah 30 Detik
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTimeWarning(false);
                  handleTimeExpired();
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-[#1d1d1f] text-xs font-semibold text-white shadow-xs tap-bounce hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
              >
                Lanjut Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
