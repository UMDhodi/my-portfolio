import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

/* eslint-disable @next/next/no-page-custom-font */
export const metadata: Metadata = {
  title: "Mayank Dhodi",
  description: "Vibe Coder",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Load CDN libs before React hydrates — order matters: Three → Lenis → StringTune */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://unpkg.com/@fiddle-digital/string-tune@1.1.55/dist/index.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}