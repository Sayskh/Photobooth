"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Lock,
  Receipt,
  Settings,
  BarChart3,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { sounds } from "@/lib/sound";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

interface ThermalReceipt {
  storeName: string;
  receiptNo: string;
  date: string;
  voucherCode: string;
  nominal: string;
  instructions: string;
}

interface VoucherItem {
  id: string;
  code: string;
  amount: number;
  isUsed: boolean;
  createdAt: string;
}

interface StatsData {
  totalSessions: number;
  completedSessions: number;
  totalVouchers: number;
  usedVouchers: number;
  totalPrints: number;
  totalRevenue: number;
}

export function AdminModal({ isOpen, onClose, onSettingsSaved }: AdminModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"CASHIER" | "SETTINGS" | "STATS">("CASHIER");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  const [generatedReceipt, setGeneratedReceipt] = useState<ThermalReceipt | null>(null);

  // Settings State
  const [storeName, setStoreName] = useState<string>("KioskSnap Studio");
  const [boothName, setBoothName] = useState<string>("Booth Kiosk 1");
  const [price, setPrice] = useState<number>(30000);
  const [includedPrints, setIncludedPrints] = useState<number>(2);
  const [sessionTimeout, setSessionTimeout] = useState<number>(480);
  const [watermarkText, setWatermarkText] = useState<string>("KioskSnap • Photobooth");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  // Stats State
  const [stats, setStats] = useState<StatsData | null>(null);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);

  // Close on Escape key (R-32)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // List connected camera devices
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      const cams = devices.filter((d) => d.kind === "videoinput");
      setVideoDevices(cams);
      if (cams.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(cams[0].deviceId);
      }
    });
  }, [isOpen, selectedDeviceId]);

  // Load Dashboard Data & Booth Settings
  const loadDashboardData = async () => {
    try {
      const [resStats, resVouchers, resBooth] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()),
        fetch("/api/admin/vouchers").then((r) => r.json()),
        fetch("/api/admin/booth").then((r) => r.json()),
      ]);

      if (resStats.success) setStats(resStats.stats);
      if (resVouchers.success) setVouchers(resVouchers.vouchers);
      if (resBooth.success && resBooth.booth) {
        const b = resBooth.booth;
        if (b.storeName) setStoreName(b.storeName);
        if (b.name) setBoothName(b.name);
        if (b.price) setPrice(b.price);
        if (b.includedPrints) setIncludedPrints(b.includedPrints);
        if (b.sessionTimeout) setSessionTimeout(b.sessionTimeout);
        if (b.watermarkText) setWatermarkText(b.watermarkText);
        if (b.cameraDeviceId) setSelectedDeviceId(b.cameraDeviceId);
      }
    } catch (e) {
      console.error("Dashboard data load error:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  if (!isOpen) return null;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setIsLoading(true);
    setPinError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();
      if (data.success) {
        sounds.playSuccess();
        setIsAuthenticated(true);
      } else {
        setPinError("PIN salah.");
        sounds.playTick();
      }
    } catch {
      setPinError("Koneksi gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCashReceipt = async () => {
    sounds.playClick();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price }),
      });
      const data = await res.json();
      if (data.success) {
        sounds.playSuccess();
        setGeneratedReceipt(data.receiptData);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintThermal = () => {
    sounds.playClick();
    window.print();
  };

  const handleSaveSettings = async () => {
    sounds.playClick();
    setIsLoading(true);
    setSettingsSuccessMsg(null);
    try {
      await fetch("/api/admin/booth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: boothName,
          storeName,
          price: Number(price),
          includedPrints: Number(includedPrints),
          sessionTimeout: Number(sessionTimeout),
          watermarkText,
          cameraDeviceId: selectedDeviceId,
        }),
      });
      sounds.playSuccess();
      setSettingsSuccessMsg("Pengaturan berhasil disimpan.");
      if (onSettingsSaved) {
        onSettingsSaved();
      }
      setTimeout(() => setSettingsSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-6 select-none font-sans">
      {/* Thermal Receipt Print-Only Layout */}
      {generatedReceipt && (
        <div className="hidden print-only font-mono text-black text-xs p-2 max-w-[58mm]">
          <div className="text-center font-bold text-sm mb-1">{generatedReceipt.storeName}</div>
          <div className="text-center text-[10px] mb-2">{generatedReceipt.date}</div>
          <div className="border-b border-black border-dashed my-1" />
          <div className="flex justify-between my-1">
            <span>Nomor:</span>
            <span>{generatedReceipt.receiptNo}</span>
          </div>
          <div className="flex justify-between my-1">
            <span>Total:</span>
            <span className="font-bold">{generatedReceipt.nominal}</span>
          </div>
          <div className="border-b border-black border-dashed my-2" />
          <div className="text-center my-2">
            <span className="block text-[10px]">KODE TOKEN PHOTOBOOTH:</span>
            <span className="text-xl font-black tracking-widest">{generatedReceipt.voucherCode}</span>
          </div>
          <div className="border-b border-black border-dashed my-2" />
          <div className="text-center text-[9px] mt-2 leading-tight">
            {generatedReceipt.instructions}
          </div>
        </div>
      )}

      {/* Screen Modal Dialog */}
      <div className="no-print relative flex flex-col h-full max-h-[88vh] w-full max-w-4xl rounded-2xl bg-white border border-zinc-200 shadow-xl overflow-hidden text-zinc-900">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
              <Lock className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-zinc-900">
              Panel Kasir dan Administrasi KioskSnap
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Tutup panel"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Auth Barrier */}
        {!isAuthenticated ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-zinc-50">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200 text-zinc-700">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              Masukkan PIN Kasir
            </h3>
            <p className="text-xs text-zinc-600 mb-6 max-w-xs">
              Akses khusus kasir untuk mencetak token transaksi tunai dan konfigurasi hardware.
            </p>

            <form onSubmit={handlePinSubmit} className="flex flex-col items-center gap-3 w-full max-w-xs">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN Default: 1234"
                className="h-12 w-full rounded-lg bg-white border border-zinc-200 px-4 text-center font-mono text-xl tracking-widest text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />

              {pinError && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !pinInput}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-xs font-semibold text-white transition active:scale-98 disabled:opacity-50 hover:bg-zinc-800 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Buka Panel</span>}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex flex-1 flex-col overflow-hidden bg-white">
            {/* Tab Navigation */}
            <div className="flex border-b border-zinc-200 bg-zinc-50 px-6 pt-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("CASHIER");
                }}
                className={`flex min-h-[44px] items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                  activeTab === "CASHIER"
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Kasir (Struk Tunai)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("SETTINGS");
                }}
                className={`flex min-h-[44px] items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                  activeTab === "SETTINGS"
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Pengaturan Kios dan Tarif</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("STATS");
                }}
                className={`flex min-h-[44px] items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                  activeTab === "STATS"
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Rekapitulasi</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
              {/* Tab 1: Kasir & Struk */}
              {activeTab === "CASHIER" && (
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-zinc-900 mb-1">
                      Transaksi Pembayaran Tunai
                    </h4>
                    <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
                      Klik tombol di bawah ketika pelanggan membayar tunai sebesar <strong>Rp {price.toLocaleString("id-ID")}</strong> di kasir. Sistem akan menghasilkan kode token 6-digit dan struk thermal.
                    </p>

                    <button
                      type="button"
                      onClick={handleGenerateCashReceipt}
                      disabled={isLoading}
                      className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-lg bg-zinc-900 text-sm font-semibold text-white shadow-xs transition active:scale-98 disabled:opacity-50 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Buat Token dan Cetak Struk (Rp {price.toLocaleString("id-ID")})</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Receipt Preview */}
                  {generatedReceipt && (
                    <div className="w-full md:w-72 rounded-xl bg-white p-5 font-mono text-zinc-900 border border-zinc-200 shadow-sm text-xs">
                      <div className="text-center font-bold text-sm mb-1">{generatedReceipt.storeName}</div>
                      <div className="text-center text-[10px] text-zinc-600 mb-2">{generatedReceipt.date}</div>
                      <div className="border-b border-dashed border-zinc-300 my-2" />
                      <div className="flex justify-between my-1">
                        <span>No. Transaksi:</span>
                        <span>{generatedReceipt.receiptNo}</span>
                      </div>
                      <div className="flex justify-between my-1 font-bold">
                        <span>Total Bayar:</span>
                        <span>{generatedReceipt.nominal}</span>
                      </div>
                      <div className="border-b border-dashed border-zinc-300 my-2" />
                      <div className="text-center my-3 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                        <span className="block text-[10px] font-bold text-zinc-600">KODE TOKEN:</span>
                        <span className="text-xl font-bold tracking-widest text-zinc-900">{generatedReceipt.voucherCode}</span>
                      </div>
                      <p className="text-center text-[9px] text-zinc-600 leading-tight mb-4">
                        {generatedReceipt.instructions}
                      </p>

                      <button
                        type="button"
                        onClick={handlePrintThermal}
                        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-zinc-900 text-white font-medium text-xs transition active:scale-95 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Cetak Struk Thermal</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Settings (Lengkap & Fleksibel) */}
              {activeTab === "SETTINGS" && (
                <div className="max-w-2xl space-y-6">
                  {settingsSuccessMsg && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{settingsSuccessMsg}</span>
                    </div>
                  )}

                  {/* Section 1: Tarif & Paket */}
                  <div className="rounded-xl bg-white p-5 border border-zinc-200 shadow-2xs space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-2">
                      Tarif dan Paket Cetak
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="priceInput" className="block text-xs font-bold text-zinc-800 mb-1.5">
                          Harga Sesi Foto (Rp)
                        </label>
                        <input
                          id="priceInput"
                          type="number"
                          step={1000}
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="min-h-[44px] w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 text-xs font-mono font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <span className="text-[11px] text-zinc-600 mt-1 block">
                          Tarif yang tampil di layar kasir & pembayaran QRIS.
                        </span>
                      </div>

                      <div>
                        <label htmlFor="includedPrintsInput" className="block text-xs font-bold text-zinc-800 mb-1.5">
                          Strip Cetak Gratis Termasuk Paket
                        </label>
                        <input
                          id="includedPrintsInput"
                          type="number"
                          min={1}
                          max={10}
                          value={includedPrints}
                          onChange={(e) => setIncludedPrints(Number(e.target.value))}
                          className="min-h-[44px] w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 text-xs font-mono font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <span className="text-[11px] text-zinc-600 mt-1 block">
                          Jumlah lembar foto fisik yang otomatis dicetak kios.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Identitas & Toko */}
                  <div className="rounded-xl bg-white p-5 border border-zinc-200 shadow-2xs space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-2">
                      Identitas Toko dan Tampilan
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="storeNameInput" className="block text-xs font-bold text-zinc-800 mb-1.5">
                          Nama Usaha / Kafe
                        </label>
                        <input
                          id="storeNameInput"
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="Contoh: KioskSnap Studio • Kopi Senja"
                          className="min-h-[44px] w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <span className="text-[11px] text-zinc-600 mt-1 block">
                          Dicetak pada header struk kasir thermal.
                        </span>
                      </div>

                      <div>
                        <label htmlFor="watermarkInput" className="block text-xs font-bold text-zinc-800 mb-1.5">
                          Teks Footer / Watermark Frame
                        </label>
                        <input
                          id="watermarkInput"
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="Contoh: KioskSnap • Photobooth"
                          className="min-h-[44px] w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <span className="text-[11px] text-zinc-600 mt-1 block">
                          Tertulis di bagian bawah cetakan & unduhan foto.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Hardware & Sesi */}
                  <div className="rounded-xl bg-white p-5 border border-zinc-200 shadow-2xs space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-2">
                      Hardware dan Durasi Sesi
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cameraSelect" className="block text-xs font-bold text-zinc-800 mb-1.5">
                          Pilihan Kamera Aktif
                        </label>
                        <select
                          id="cameraSelect"
                          value={selectedDeviceId}
                          onChange={(e) => setSelectedDeviceId(e.target.value)}
                          className="min-h-[44px] w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        >
                          {videoDevices.length === 0 ? (
                            <option value="">Kamera Default Peramban</option>
                          ) : (
                            videoDevices.map((d) => (
                              <option key={d.deviceId} value={d.deviceId}>
                                {d.label || `Kamera ${d.deviceId.slice(0, 8)}`}
                              </option>
                            ))
                          )}
                        </select>
                        <span className="text-[11px] text-zinc-600 mt-1 block">
                          Webcam laptop atau USB Capture Card DSLR.
                        </span>
                      </div>

                      <div>
                        <label htmlFor="timeoutInput" className="block text-xs font-bold text-zinc-800 mb-1.5">
                          Batas Waktu Sesi Global (Detik)
                        </label>
                        <input
                          id="timeoutInput"
                          type="number"
                          step={30}
                          value={sessionTimeout}
                          onChange={(e) => setSessionTimeout(Number(e.target.value))}
                          className="min-h-[44px] w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 text-xs font-mono font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <span className="text-[11px] text-zinc-600 mt-1 block">
                          {Math.floor(sessionTimeout / 60)} menit ({sessionTimeout} detik) batas waktu jepret dan kustomisasi.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isLoading}
                      className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white transition active:scale-95 hover:bg-zinc-800 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Simpan Seluruh Pengaturan Kios</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Stats */}
              {activeTab === "STATS" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-xl bg-white p-4 border border-zinc-200 shadow-2xs">
                      <span className="text-xs font-medium text-zinc-600">Total Pemasukan</span>
                      <div className="text-lg font-bold text-zinc-900 mt-1">
                        Rp {(stats?.totalRevenue || 0).toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-zinc-200 shadow-2xs">
                      <span className="text-xs font-medium text-zinc-600">Total Sesi Foto</span>
                      <div className="text-lg font-bold text-zinc-900 mt-1">
                        {stats?.totalSessions || 0}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-zinc-200 shadow-2xs">
                      <span className="text-xs font-medium text-zinc-600">Kertas Cetak Fisik</span>
                      <div className="text-lg font-bold text-zinc-900 mt-1">
                        {stats?.totalPrints || 0} Lembar
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-zinc-200 shadow-2xs">
                      <span className="text-xs font-medium text-zinc-600">Voucher Terpakai</span>
                      <div className="text-lg font-bold text-zinc-900 mt-1">
                        {stats?.usedVouchers || 0} / {stats?.totalVouchers || 0}
                      </div>
                    </div>
                  </div>

                  {/* Table of Vouchers */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h5 className="text-xs font-bold text-zinc-900">Daftar Voucher Kasir Terbaru</h5>
                      <button
                        type="button"
                        onClick={loadDashboardData}
                        className="flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Segarkan</span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden max-h-56 overflow-y-auto shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                          <tr>
                            <th className="p-2.5 font-semibold">Kode Token</th>
                            <th className="p-2.5 font-semibold">Nominal</th>
                            <th className="p-2.5 font-semibold">Status</th>
                            <th className="p-2.5 font-semibold">Waktu Buat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 font-mono text-zinc-800">
                          {vouchers.map((v) => (
                            <tr key={v.id} className="hover:bg-zinc-50">
                              <td className="p-2.5 font-bold text-zinc-900">{v.code}</td>
                              <td className="p-2.5">Rp {v.amount.toLocaleString("id-ID")}</td>
                              <td className="p-2.5">
                                {v.isUsed ? (
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                                    Sudah Digunakan
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                                    Belum Digunakan
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-[10px] text-zinc-600">
                                {new Date(v.createdAt).toLocaleTimeString("id-ID")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
