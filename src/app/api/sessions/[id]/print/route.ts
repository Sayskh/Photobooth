import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { copies = 1 } = await req.json();

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak ditemukan." },
        { status: 404 }
      );
    }

    const printJob = await prisma.printJob.create({
      data: {
        sessionId,
        copies: Number(copies) || 1,
        status: "SUCCESS",
      },
    });

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      printJobId: printJob.id,
      copies: printJob.copies,
    });
  } catch (error) {
    console.error("Error creating print job:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mencatat tugas cetak." },
      { status: 500 }
    );
  }
}
