import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KioskSnap - Photobooth IMK",
  description: "Self-Service Touchscreen Photobooth Kiosk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen w-screen overflow-hidden bg-zinc-50 text-zinc-900 antialiased selection:bg-transparent">
        {children}
      </body>
    </html>
  );
}
