import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const {
      frameTemplateId,
      filterSelected,
      frameColor,
      stickersData,
      finalImagePath,
      videoMontageUrl,
    } = await req.json();

    if (!sessionId || !frameTemplateId || !finalImagePath) {
      return NextResponse.json(
        { success: false, message: "Data komposit tidak lengkap." },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak ditemukan." },
        { status: 404 }
      );
    }

    const composite = await prisma.photoComposite.upsert({
      where: { sessionId },
      update: {
        frameTemplateId,
        filterSelected: filterSelected || "NORMAL",
        frameColor: frameColor || "#FFFFFF",
        stickersData: stickersData ? JSON.stringify(stickersData) : null,
        finalImagePath,
        videoMontageUrl: videoMontageUrl || null,
      },
      create: {
        sessionId,
        frameTemplateId,
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
