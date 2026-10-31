import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rebooth - Photobooth IMK",
  description: "Self-Service Touchscreen Photobooth Kiosk",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-zinc-200 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
