import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Space_Mono } from "next/font/google";
import { SoundLayer } from "@/components/sound";
import "./globals.css";

// Downloaded at build time and served from this app, like the rest of it: no request to Google
// from anyone's browser.
const outfit = Outfit({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "spill. · NextQom",
  description: "Anonymous feedback for the NextQom team. Honest, kind, slightly unhinged.",
  applicationName: "spill.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#070b12" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full ${outfit.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body className="min-h-full">
        <SoundLayer />
        {children}
      </body>
    </html>
  );
}
