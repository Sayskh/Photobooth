import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, message: "Kode voucher tidak valid." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const voucher = await prisma.voucher.findUnique({
      where: { code: cleanCode },
    });

    if (!voucher) {
      return NextResponse.json(
        { success: false, message: "Kode voucher tidak ditemukan." },
        { status: 404 }
      );
    }

    if (voucher.isUsed) {
      return NextResponse.json(
        { success: false, message: "Kode voucher sudah pernah digunakan." },
        { status: 400 }
      );
    }

    if (new Date() > voucher.expiresAt) {
      return NextResponse.json(
        { success: false, message: "Kode voucher telah kedaluwarsa." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      voucher: {
        code: voucher.code,
        amount: voucher.amount,
      },
    });
  } catch (error) {
    console.error("Error verifying voucher:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memverifikasi voucher." },
      { status: 500 }
    );
  }
}
