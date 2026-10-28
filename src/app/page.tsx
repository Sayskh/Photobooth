"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AttractScreen } from "@/components/AttractScreen";
import { PaymentScreen } from "@/components/PaymentScreen";
import { FrameSelectScreen, TemplateChoice } from "@/components/FrameSelectScreen";
import { CameraCaptureScreen } from "@/components/CameraCaptureScreen";
import { CanvasCustomizerScreen } from "@/components/CanvasCustomizerScreen";
import { PrintOutputScreen } from "@/components/PrintOutputScreen";
import { AdminModal } from "@/components/AdminModal";
import { StickerItem, renderCompositeCanvas } from "@/lib/canvas";

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
  storeName: "KioskSnap Studio",
  price: 30000,
  includedPrints: 2,
  sessionTimeout: 480,
  watermarkText: "KioskSnap • Photobooth",
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
  const [finalCompositeImage, setFinalCompositeImage] = useState<string>("");
  const [qrToken, setQrToken] = useState<string>("");

  // Load Booth Configuration
  const loadBoothConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/booth");
      const data = await res.json();
      if (data.success && data.booth) {
        setBoothConfig({
          name: data.booth.name || "Booth Utama",
          storeName: data.booth.storeName || "KioskSnap Studio",
          price: Number(data.booth.price) || 30000,
          includedPrints: Number(data.booth.includedPrints) || 2,
          sessionTimeout: Number(data.booth.sessionTimeout) || 480,
          watermarkText: data.booth.watermarkText || "KioskSnap • Photobooth",
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

  // Global Session Countdown Timer
  useEffect(() => {
    // Only countdown during active photo/edit session
    const isSessionActive =
      sessionId !== "" &&
      (currentStep === "FRAME_SELECT" || currentStep === "CAPTURE" || currentStep === "CUSTOMIZE");

    if (!isSessionActive) return;

    if (sessionSecondsLeft <= 0) {
      handleTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setSessionSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, currentStep, sessionSecondsLeft]);

  // Handle session timeout: auto render and finalize
  const handleTimeExpired = async () => {
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
        handleFinishCustomization(rawPhotos[0], [], "NORMAL", selectedFrameColor);
      }
    } else {
      handleReset();
    }
  };

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
  const handleAllPhotosCaptured = async (photos: string[]) => {
    setRawPhotos(photos);

    // Save raw photo shots to server in background
    if (sessionId) {
      photos.forEach((dataUrl, idx) => {
        fetch(`/api/sessions/${sessionId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poseIndex: idx + 1, dataUrl }),
        }).catch(console.error);
      });
    }

    setCurrentStep("CUSTOMIZE");
  };

  // 5. From Customizer -> Back to Camera for Retake
  const handleRetakePhotos = () => {
    setCurrentStep("CAPTURE");
  };

  // 6. From Customizer -> Print & QR Output
  const handleFinishCustomization = async (
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
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQrToken(data.qrDownloadToken);
      }
    } catch (e) {
      console.error("Save composite error:", e);
    }

    setCurrentStep("PRINT_OUTPUT");
  };

  // Reset to initial Idle state
  const handleReset = () => {
    setSessionId("");
    setSessionSecondsLeft(boothConfig.sessionTimeout);
    setSelectedTemplate(null);
    setSelectedThemeId("THEATER_TICKET");
    setSelectedFrameColor("#FFFFFF");
    setRawPhotos([]);
    setFinalCompositeImage("");
    setQrToken("");
    setCurrentStep("IDLE");
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
    </main>
  );
}
