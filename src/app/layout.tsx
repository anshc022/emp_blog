import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import { SoundLayer } from "@/components/sound";
import "./globals.css";

export const metadata: Metadata = {
  title: "spill.",
  description: "anonymous feedback for your team. honest, kind, slightly unhinged.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <SoundLayer />
        {children}
      </body>
    </html>
  );
}
