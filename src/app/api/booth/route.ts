import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let booth = await prisma.booth.findFirst();
    if (!booth) {
      booth = await prisma.booth.create({
        data: {
          name: "Booth Kiosk 1",
          storeName: "Rebooth Studio",
          price: 30000,
          includedPrints: 2,
          sessionTimeout: 480,
          watermarkText: "Rebooth • Photobooth",
          isActive: true,
        },
      });
    }

    const templates = await prisma.frameTemplate.findMany({
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      booth,
      templates,
    });
  } catch (error) {
    console.error("Error fetching booth:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat konfigurasi kios." },
      { status: 500 }
    );
  }
}
