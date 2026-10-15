import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cinzel, Rajdhani } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WoWPlaystyle",
  description:
    "Compose custom RPG item cards and export them as transparent, 4K-ready PNGs.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${rajdhani.variable}`}>
      <body className="font-sans font-medium antialiased">{children}</body>
    </html>
  );
}
