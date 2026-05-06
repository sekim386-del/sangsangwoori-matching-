import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "상상우리 매칭",
  description: "시니어 ↔ 일자리 자동 매칭 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased">
        <Nav />
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
