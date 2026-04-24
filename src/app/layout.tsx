import type { Metadata } from "next";
import { Work_Sans, Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "marketiS - Social Media Manager",
  description: "AI-powered social media content management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${workSans.variable}`}>
        <div className="flex h-screen">
          <Sidebar />
          <main
            className="flex-1 overflow-y-auto p-8 animate-slide-right"
            style={{ background: "linear-gradient(180deg, #f8f9fc 0%, #f3f4f9 100%)" }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
