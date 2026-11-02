"use client";

import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Delete, QrCode, Receipt, AlertCircle, Loader2 } from "lucide-react";
import { sounds } from "@/lib/sound";

interface PaymentScreenProps {
  onBack: () => void;
  onPaymentSuccess: (sessionId: string) => void;
  price?: number;
  includedPrints?: number;
}

export function PaymentScreen({
  onBack,
  onPaymentSuccess,
  price = 30000,
  includedPrints = 2,
}: PaymentScreenProps) {
  const [activeTab, setActiveTab] = useState<"CASH" | "QRIS">("CASH");
  const [voucherInput, setVoucherInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleKeypadPress = (val: string) => {
    sounds.playClick();
    setErrorMsg(null);
    if (val === "CLEAR") {
      setVoucherInput("");
      return;
    }
    if (val === "BACKSPACE") {
      setVoucherInput((prev) => prev.slice(0, -1));
      return;
    }
    if (voucherInput.length >= 7) return;
    setVoucherInput((prev) => prev + val);
  };

  const handleVerifyVoucher = async () => {
    sounds.playClick();
    if (!voucherInput.trim()) {
      setErrorMsg("Ketik kode token dari struk kasir.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      let codeToTest = voucherInput.trim().toUpperCase();
      if (!codeToTest.startsWith("KS-") && !codeToTest.startsWith("KS")) {
        codeToTest = `KS-${codeToTest}`;
      } else if (codeToTest.startsWith("KS") && !codeToTest.startsWith("KS-")) {
        codeToTest = `KS-${codeToTest.slice(2)}`;
      }

      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "CASH_VOUCHER",
          voucherCode: codeToTest,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message || "Token voucher tidak valid.");
        sounds.playTick();
        return;
      }

      sounds.playSuccess();
      onPaymentSuccess(data.sessionId);
    } catch {
      setErrorMsg("Koneksi gagal. Periksa koneksi lokal kios.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateQrisSuccess = async () => {
    sounds.playClick();
    setIsLoading(true);
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "QRIS" }),
      });
      const data = await res.json();
      if (data.success) {
        sounds.playSuccess();
        onPaymentSuccess(data.sessionId);
      } else {
        setErrorMsg("Gagal menginisialisasi pembayaran QRIS.");
      }
    } catch {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col justify-between studio-bg p-4 md:p-8 select-none font-sans overflow-y-auto no-scrollbar">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-700 border border-zinc-200 shadow-xs tap-bounce hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-700" />
          <span>Kembali</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">
            Langkah Pembayaran
          </span>
          <h2 className="text-lg md:text-2xl font-bold tracking-tight text-zinc-900 mt-0.5">
            Pembayaran Sesi Foto
          </h2>
          <div className="mt-1 flex items-center justify-center text-xs text-zinc-600 font-medium">
            <span>Tarif: <strong className="text-zinc-900 font-bold">Rp {price.toLocaleString("id-ID")}</strong></span>
          </div>
        </div>

        <div className="w-24" />
      </div>

      {/* Main Content Area */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-4">
        {/* Apple-style Segmented Control Switcher */}
        <div className="mb-4 flex w-full gap-1 rounded-xl bg-zinc-200/80 p-1 border border-zinc-200">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab("CASH");
              setErrorMsg(null);
            }}
            className={`flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition focus-visible:outline-none cursor-pointer ${
              activeTab === "CASH"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Tunai (Struk Kasir)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab("QRIS");
              setErrorMsg(null);
            }}
            className={`flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition focus-visible:outline-none cursor-pointer ${
              activeTab === "QRIS"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Nontunai (QRIS)</span>
          </button>
        </div>

        {/* Tab 1: Cash Voucher Numpad */}
        {activeTab === "CASH" && (
          <div className="flex w-full flex-col items-center rounded-2xl bg-white p-5 md:p-6 border border-zinc-200/80 shadow-xs">
            <span className="text-xs font-semibold text-zinc-700 mb-2">
              Ketik kode token dari struk pembayaran kasir:
            </span>

            {/* Display Input */}
            <div className="mb-3 md:mb-4 flex h-14 w-full items-center justify-center rounded-xl bg-zinc-50 px-4 font-mono text-2xl font-bold tracking-widest text-zinc-900 border border-zinc-200">
              {voucherInput ? (
                <span>
                  {!voucherInput.startsWith("KS") ? `KS-${voucherInput}` : voucherInput}
                </span>
              ) : (
                <span className="text-zinc-400">KS-____</span>
              )}
            </div>

            {errorMsg && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 border border-red-200 w-full">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Virtual Numpad */}
            <div className="grid w-full grid-cols-3 gap-2 md:gap-2.5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  className="flex min-h-[50px] md:min-h-[54px] items-center justify-center rounded-xl bg-zinc-50 text-xl font-semibold text-zinc-900 border border-zinc-200 tap-bounce hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
                >
                  {key}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleKeypadPress("CLEAR")}
                className="flex min-h-[50px] md:min-h-[54px] items-center justify-center rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 border border-zinc-200 tap-bounce hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress("0")}
                className="flex min-h-[50px] md:min-h-[54px] items-center justify-center rounded-xl bg-zinc-50 text-xl font-semibold text-zinc-900 border border-zinc-200 tap-bounce hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
              >
                0
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress("BACKSPACE")}
                className="flex min-h-[50px] md:min-h-[54px] items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 tap-bounce hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
                aria-label="Hapus satu angka"
              >
                <Delete className="h-5 w-5" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleVerifyVoucher}
              disabled={isLoading || !voucherInput}
              className="mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white shadow-xs tap-bounce disabled:opacity-50 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verifikasi dan Mulai Sesi</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: QRIS Dynamic Simulator */}
        {activeTab === "QRIS" && (
          <div className="flex w-full flex-col items-center rounded-2xl bg-white p-5 md:p-6 border border-zinc-200/80 shadow-xs text-center">
            <div className="flex h-7 items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 text-white font-bold tracking-wider text-[11px] mb-3">
              <span>QRIS</span>
              <span className="text-[9px] bg-red-600 px-1 py-0.2 rounded font-semibold">
                STANDAR
              </span>
            </div>

            {/* Simulated QR Code */}
            <div className="mb-3 flex h-44 w-44 md:h-48 md:w-48 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 p-2">
              <QrCode className="h-36 w-36 md:h-40 md:w-40 text-zinc-900" />
            </div>

            <p className="text-xs font-semibold text-zinc-800 mb-1">
              Buka aplikasi m-Banking atau e-Wallet favorit Anda
            </p>
            <p className="text-[11px] text-zinc-500 font-normal mb-4">
              Sistem akan otomatis memverifikasi transaksi yang berhasil.
            </p>

            <button
              type="button"
              onClick={handleSimulateQrisSuccess}
              disabled={isLoading}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] text-xs font-semibold text-white shadow-xs tap-bounce disabled:opacity-50 hover:bg-black cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simulasi Bayar QRIS Sukses</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-zinc-500">
        Butuh bantuan? Silakan hubungi kasir atau staf kafe.
      </div>
    </div>
  );
}
