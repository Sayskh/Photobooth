import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    booth: "Rebooth",
    timestamp: new Date().toISOString(),
  });
}
