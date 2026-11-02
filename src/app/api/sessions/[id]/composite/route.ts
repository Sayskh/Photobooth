import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Max 15MB base64 string (~11MB image data)
const MAX_BASE64_LENGTH = 15 * 1024 * 1024;

const compositeSchema = z.object({
  frameTemplateId: z.string().trim().min(1).max(100),
  filterSelected: z.string().trim().max(50).default("NORMAL"),
  frameColor: z.string().trim().max(30).default("#FFFFFF"),
  stickersData: z.unknown().optional(),
  finalImagePath: z
    .string()
    .trim()
    .min(10)
    .max(MAX_BASE64_LENGTH, "Ukuran gambar terlalu besar (maksimal 15MB).")
    .refine(
      (val) => val.startsWith("data:image/") || val.startsWith("/uploads/") || val.startsWith("http"),
      {
        message: "Format finalImagePath harus berupa Data URL (data:image/...) atau URL valid.",
      }
    ),
  videoMontageUrl: z.string().trim().max(MAX_BASE64_LENGTH).nullable().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "ID sesi diperlukan." },
        { status: 400 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = compositeSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data komposit tidak valid.",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      frameTemplateId,
      filterSelected,
      frameColor,
      stickersData,
      finalImagePath,
      videoMontageUrl,
    } = parseResult.data;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak ditemukan." },
        { status: 404 }
      );
    }

    // Pastikan frameTemplateId valid di database agar foreign key tidak melanggar constraint
    let validTemplateId = frameTemplateId;
    const existingTemplate = await prisma.frameTemplate.findUnique({
      where: { id: validTemplateId },
    });

    if (!existingTemplate) {
      // Buat template fallback on-the-fly jika belum ada di database
      const fallback = await prisma.frameTemplate.upsert({
        where: { id: validTemplateId },
        update: {},
        create: {
          id: validTemplateId,
          name: validTemplateId === "template-strip-4" ? "4 Pose Foto" : "3 Pose Foto",
          layoutType: validTemplateId === "template-strip-4" ? "STRIP_2X6_4" : "STRIP_2X6_3",
          slotsCount: validTemplateId === "template-strip-4" ? 4 : 3,
          aspectRatio: "2:3",
          isActive: true,
        },
      });
      validTemplateId = fallback.id;
    }

    const composite = await prisma.photoComposite.upsert({
      where: { sessionId },
      update: {
        frameTemplateId: validTemplateId,
        filterSelected: filterSelected || "NORMAL",
        frameColor: frameColor || "#FFFFFF",
        stickersData: stickersData ? JSON.stringify(stickersData) : null,
        finalImagePath,
        videoMontageUrl: videoMontageUrl || null,
      },
      create: {
        sessionId,
        frameTemplateId: validTemplateId,
        filterSelected: filterSelected || "NORMAL",
        frameColor: frameColor || "#FFFFFF",
        stickersData: stickersData ? JSON.stringify(stickersData) : null,
        finalImagePath,
        videoMontageUrl: videoMontageUrl || null,
      },
    });

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "PRINTING",
      },
    });

    const downloadUrl = `/download/${composite.qrDownloadToken}`;

    return NextResponse.json({
      success: true,
      qrDownloadToken: composite.qrDownloadToken,
      downloadUrl,
    });
  } catch (error) {
    console.error("Error saving photo composite:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan hasil foto." },
      { status: 500 }
    );
  }
}
