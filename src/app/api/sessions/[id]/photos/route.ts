import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { poseIndex, dataUrl } = await req.json();

    if (!sessionId || poseIndex === undefined || !dataUrl) {
      return NextResponse.json(
        { success: false, message: "Data foto tidak lengkap." },
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

    const photoShot = await prisma.photoShot.create({
      data: {
        sessionId,
        poseIndex: Number(poseIndex),
        filePath: dataUrl,
      },
    });

    return NextResponse.json({
      success: true,
      photoShotId: photoShot.id,
      poseIndex: photoShot.poseIndex,
    });
  } catch (error) {
    console.error("Error saving photo shot:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan foto." },
      { status: 500 }
    );
  }
}
