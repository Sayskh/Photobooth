import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalSessions = await prisma.session.count();
    const completedSessions = await prisma.session.count({
      where: { status: "COMPLETED" },
    });

    const totalVouchers = await prisma.voucher.count();
    const usedVouchers = await prisma.voucher.count({
      where: { isUsed: true },
    });

    const printJobs = await prisma.printJob.findMany({
      select: { copies: true },
    });
    const totalPrints = printJobs.reduce((acc, curr) => acc + curr.copies, 0);

    const transactions = await prisma.transaction.findMany({
      where: { status: "PAID" },
      select: { amount: true },
    });
    const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions,
        completedSessions,
        totalVouchers,
        usedVouchers,
        totalPrints,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik." },
      { status: 500 }
    );
  }
}
