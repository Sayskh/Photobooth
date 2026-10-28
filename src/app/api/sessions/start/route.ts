import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { method, voucherCode, boothId } = await req.json();

    const currentBooth = boothId
      ? await prisma.booth.findUnique({ where: { id: boothId } })
      : await prisma.booth.findFirst();

    if (!currentBooth) {
      return NextResponse.json(
        { success: false, message: "Kios tidak ditemukan." },
        { status: 404 }
      );
    }

    if (method === "CASH_VOUCHER") {
      if (!voucherCode) {
        return NextResponse.json(
          { success: false, message: "Kode voucher wajib diisi." },
          { status: 400 }
        );
      }

      const cleanCode = voucherCode.trim().toUpperCase();
      const voucher = await prisma.voucher.findUnique({
        where: { code: cleanCode },
      });

      if (!voucher || voucher.isUsed || new Date() > voucher.expiresAt) {
        return NextResponse.json(
          { success: false, message: "Voucher tidak valid atau sudah terpakai." },
          { status: 400 }
        );
      }

      // Gunakan transaction atomic
      const session = await prisma.$transaction(async (tx) => {
        // Update voucher status
        await tx.voucher.update({
          where: { id: voucher.id },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });

        // Buat Session baru
        const newSession = await tx.session.create({
          data: {
            boothId: currentBooth.id,
            status: "FRAME_SELECT",
          },
        });

        // Buat Catatan Transaksi
        await tx.transaction.create({
          data: {
            sessionId: newSession.id,
            method: "CASH_VOUCHER",
            amount: voucher.amount,
            status: "PAID",
            voucherId: voucher.id,
            paidAt: new Date(),
          },
        });

        return newSession;
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        sessionStatus: session.status,
      });
    } else if (method === "QRIS") {
      // Skenario QRIS (simulasi instant payment untuk kelancaran tugas IMK)
      const session = await prisma.$transaction(async (tx) => {
        const newSession = await tx.session.create({
          data: {
            boothId: currentBooth.id,
            status: "FRAME_SELECT",
          },
        });

        await tx.transaction.create({
          data: {
            sessionId: newSession.id,
            method: "QRIS",
            amount: currentBooth.price || 30000,
            status: "PAID",
            qrisRef: `QRIS-${Date.now()}`,
            paidAt: new Date(),
          },
        });

        return newSession;
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        sessionStatus: session.status,
      });
    }

    return NextResponse.json(
      { success: false, message: "Metode pembayaran tidak didukung." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error starting session:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memulai sesi." },
      { status: 500 }
    );
  }
}
