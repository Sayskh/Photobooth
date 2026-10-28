import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let booth = await prisma.booth.findFirst();
    if (!booth) {
      booth = await prisma.booth.create({
        data: {
          name: "Booth Kiosk 1",
          storeName: "KioskSnap Studio",
          price: 30000,
          includedPrints: 2,
          sessionTimeout: 480,
          watermarkText: "KioskSnap • Photobooth",
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      booth,
    });
  } catch (error) {
    console.error("Error fetching booth admin:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat pengaturan bilik." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const {
      name,
      storeName,
      price,
      includedPrints,
      sessionTimeout,
      watermarkText,
      cameraDeviceId,
    } = await req.json();

    let booth = await prisma.booth.findFirst();
    if (!booth) {
      booth = await prisma.booth.create({
        data: {
          name: name || "Booth Kiosk 1",
          storeName: storeName || "KioskSnap Studio",
          price: Number(price) || 30000,
          includedPrints: Number(includedPrints) || 2,
          sessionTimeout: Number(sessionTimeout) || 480,
          watermarkText: watermarkText || "KioskSnap • Photobooth",
          cameraDeviceId: cameraDeviceId || null,
        },
      });
    } else {
      booth = await prisma.booth.update({
        where: { id: booth.id },
        data: {
          ...(name !== undefined && { name }),
          ...(storeName !== undefined && { storeName }),
          ...(price !== undefined && { price: Number(price) }),
          ...(includedPrints !== undefined && { includedPrints: Number(includedPrints) }),
          ...(sessionTimeout !== undefined && { sessionTimeout: Number(sessionTimeout) }),
          ...(watermarkText !== undefined && { watermarkText }),
          ...(cameraDeviceId !== undefined && { cameraDeviceId }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      booth,
    });
  } catch (error) {
    console.error("Error updating booth:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui pengaturan bilik." },
      { status: 500 }
    );
  }
}
