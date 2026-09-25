import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "spill. — anonymous team feedback",
  description: "spill the tea, anonymously. honest, kind feedback for the whole company.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
