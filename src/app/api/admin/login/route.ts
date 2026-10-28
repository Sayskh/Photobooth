import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    const correctPin = process.env.ADMIN_PIN || "1234";

    if (pin === correctPin) {
      return NextResponse.json({
        success: true,
        message: "Autentikasi berhasil.",
      });
    }

    return NextResponse.json(
      { success: false, message: "PIN Kasir / Admin salah." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error admin login:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
