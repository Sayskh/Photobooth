"use client";

import React, { useState } from "react";
import { AdminModal } from "@/components/AdminModal";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/");
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-50 p-6 text-zinc-900 select-none font-sans">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm rounded-2xl bg-white p-8 border border-zinc-200 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Portal Kasir dan Admin</h1>
        <p className="text-xs font-medium text-zinc-600 leading-relaxed">
          Gunakan panel ini untuk mengelola voucher kasir, hardware kamera, dan laporan transaksi.
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white transition active:scale-95 hover:bg-zinc-800 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <span>Buka Dialog Kasir</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-1 flex min-h-[44px] items-center justify-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Layar Kios Photobooth</span>
        </button>
      </div>

      <AdminModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}
