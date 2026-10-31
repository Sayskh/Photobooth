import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/adminAuth";
import { z } from "zod";

const createVoucherSchema = z.object({
  amount: z.coerce.number().int().min(1000).max(1000000).optional(),
});

function generateVoucherCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `KS-${randomNum}`;
}

export async function GET(req: Request) {
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        createdBy: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      vouchers,
    });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar voucher." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = createVoucherSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data voucher tidak valid.",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const booth = await prisma.booth.findFirst();
    const defaultAmount = booth?.price || 30000;
    const amount = parseResult.data.amount || defaultAmount;

    let admin = await prisma.adminUser.findFirst();
    if (!admin) {
      admin = await prisma.adminUser.create({
        data: {
          username: "admin",
          passwordHash: "admin123",
          role: "ADMIN",
        },
      });
    }

    let code = generateVoucherCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await prisma.voucher.findUnique({ where: { code } });
      if (!existing) {
        isUnique = true;
      } else {
        code = generateVoucherCode();
        attempts++;
      }
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    const voucher = await prisma.voucher.create({
      data: {
        code,
        amount,
        isUsed: false,
        expiresAt,
        createdById: admin.id,
      },
    });

    const storeName = booth?.storeName || "KioskSnap Photobooth";
    const receiptData = {
      storeName,
      receiptNo: `TRX-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString("id-ID"),
      voucherCode: voucher.code,
      nominal: `Rp ${voucher.amount.toLocaleString("id-ID")}`,
      instructions: "Ketik kode 6-digit di atas pada layar anjungan photobooth.",
    };

    return NextResponse.json({
      success: true,
      voucher,
      receiptData,
    });
  } catch (error) {
    console.error("Error generating voucher:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghasilkan voucher." },
      { status: 500 }
    );
  }
}
