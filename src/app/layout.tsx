import type { Metadata } from "next";
import Script from "next/script";
import { Work_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "marketiS - Social Media Manager",
  description: "AI-powered social media content management platform",
};

const themeInitScript = `(function(){try{var k=${JSON.stringify("marketis-theme")};var t=localStorage.getItem(k);document.documentElement.dataset.theme=t==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${workSans.variable} ${jetbrainsMono.variable}`}>
        <Script id="marketis-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
