import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan." },
        { status: 400 }
      );
    }

    const composite = await prisma.photoComposite.findUnique({
      where: { qrDownloadToken: token },
      include: {
        frameTemplate: true,
        session: {
          include: {
            photoShots: {
              orderBy: { poseIndex: "asc" },
            },
          },
        },
      },
    });

    if (!composite) {
      return NextResponse.json(
        { success: false, message: "Foto tidak ditemukan atau tautan kedaluwarsa." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      compositeImage: composite.finalImagePath,
      videoMontageUrl: composite.videoMontageUrl || null,
      layoutType: composite.frameTemplate?.layoutType || "STRIP_2X6",
      shots: composite.session.photoShots.map((s) => ({
        poseIndex: s.poseIndex,
        image: s.filePath,
        liveVideo: s.liveVideoUrl || null,
      })),
      createdAt: composite.createdAt,
    });
  } catch (error) {
    console.error("Error fetching download:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil berkas foto." },
      { status: 500 }
    );
  }
}
