import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const printJobSchema = z.object({
  copies: z.coerce.number().int().min(1, "Minimal 1 salinan.").max(5, "Maksimal 5 salinan."),
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
    const parseResult = printJobSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data cetak tidak valid.",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { copies } = parseResult.data;

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
        copies,
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
