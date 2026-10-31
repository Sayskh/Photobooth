import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

const verifyVoucherSchema = z.object({
  code: z.string().trim().min(1, "Kode voucher wajib diisi.").max(30),
});

export async function POST(req: Request) {
  try {
    // Rate limit: 10 requests per minute (60,000 ms) per IP
    const clientIp = getClientIp(req);
    const limit = checkRateLimit(`verify-voucher:${clientIp}`, 10, 60 * 1000);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan verifikasi. Coba lagi dalam ${limit.retryAfterSec} detik.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSec),
          },
        }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = verifyVoucherSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: "Kode voucher tidak valid." },
        { status: 400 }
      );
    }

    const cleanCode = parseResult.data.code.toUpperCase();
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
