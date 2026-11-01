import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/adminAuth";
import { z } from "zod";

const boothSettingsSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  storeName: z.string().trim().min(1).max(100).optional(),
  price: z.coerce.number().int().min(0).max(1000000).optional(),
  includedPrints: z.coerce.number().int().min(1).max(10).optional(),
  sessionTimeout: z.coerce.number().int().min(60).max(3600).optional(),
  watermarkText: z.string().trim().max(100).optional(),
  cameraDeviceId: z.string().trim().max(255).nullable().optional(),
});

export async function GET(req: Request) {
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

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
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = boothSettingsSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Format pengaturan bilik tidak valid.",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      storeName,
      price,
      includedPrints,
      sessionTimeout,
      watermarkText,
      cameraDeviceId,
    } = parseResult.data;

    let booth = await prisma.booth.findFirst();
    if (!booth) {
      booth = await prisma.booth.create({
        data: {
          name: name || "Booth Kiosk 1",
          storeName: storeName || "Rebooth Studio",
          price: price !== undefined ? price : 30000,
          includedPrints: includedPrints !== undefined ? includedPrints : 2,
          sessionTimeout: sessionTimeout !== undefined ? sessionTimeout : 480,
          watermarkText: watermarkText || "Rebooth • Photobooth",
          cameraDeviceId: cameraDeviceId || null,
        },
      });
    } else {
      booth = await prisma.booth.update({
        where: { id: booth.id },
        data: {
          ...(name !== undefined && { name }),
          ...(storeName !== undefined && { storeName }),
          ...(price !== undefined && { price }),
          ...(includedPrints !== undefined && { includedPrints }),
          ...(sessionTimeout !== undefined && { sessionTimeout }),
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
