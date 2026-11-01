import { NextResponse } from "next/server";
import { createAdminToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // Rate limit: 5 requests per 5 minutes (300,000 ms) per IP
    const clientIp = getClientIp(req);
    const limit = checkRateLimit(`admin-login:${clientIp}`, 5, 5 * 60 * 1000);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan login. Coba lagi dalam ${limit.retryAfterSec} detik.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSec),
          },
        }
      );
    }

    const { pin } = await req.json().catch(() => ({}));

    if (!process.env.ADMIN_PIN) {
      console.warn(
        "[SECURITY WARNING] ADMIN_PIN environment variable is not defined! Falling back to default '1234'. Set ADMIN_PIN in production."
      );
    }

    const correctPin = process.env.ADMIN_PIN || "1234";

    if (pin && typeof pin === "string" && pin === correctPin) {
      // 8 hour session expiry
      const exp = Date.now() + 8 * 60 * 60 * 1000;
      const token = createAdminToken({
        role: "admin",
        iat: Date.now(),
        exp,
      });

      const response = NextResponse.json({
        success: true,
        message: "Autentikasi berhasil.",
        token,
      });

      // Set secure HTTP-only cookie
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 8 * 60 * 60,
      });

      return response;
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
