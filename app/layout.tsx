import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

/* eslint-disable @next/next/no-page-custom-font */

const SITE_URL = "https://mayankdhodi.vercel.app/";
const SITE_NAME = "Mayank Dhodi";
const SITE_DESCRIPTION =
  "Portfolio of Mayank Dhodi Certified Data Analyst, Full-Stack Developer, and Prompt Engineer. Specializing in web development, AI automation, brand identity, and data-driven solutions. Based in India, available remotely across UAE & USA.";

export const metadata: Metadata = {
  // ─── CORE META ──────────────────────────────────────────────────────────
  title: {
    default: SITE_NAME,
    template: `%s | Mayank Dhodi`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Mayank Dhodi",
    "Full-Stack Developer",
    "Data Analyst",
    "AI Engineer",
    "Prompt Engineer",
    "Web Development",
    "AI Automation",
    "Brand Identity",
    "Portfolio",
    "React Developer",
    "Next.js Developer",
    "Vibe Coder",
    "India Developer",
    "Remote Developer",
  ],
  authors: [{ name: "Mayank Dhodi", url: SITE_URL }],
  creator: "Mayank Dhodi",
  publisher: "Mayank Dhodi",

  // ─── CANONICAL & ALTERNATES ─────────────────────────────────────────────
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },

  // ─── OPEN GRAPH ─────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Mayank Dhodi",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mayank Dhodi — Full-Stack Developer, Data Analyst & AI Engineer",
        type: "image/png",
      },
    ],
  },

  // ─── TWITTER CARD ───────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@mayankdhodi",
  },

  // ─── ROBOTS ─────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ─── ICONS ──────────────────────────────────────────────────────────────
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // ─── CATEGORY ───────────────────────────────────────────────────────────
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        {/* JSON-LD Structured Data — Person + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Mayank Dhodi",
                url: SITE_URL,
                image: `${SITE_URL}/og-image.png`,
                jobTitle: "Full-Stack Developer & Data Analyst",
                description: SITE_DESCRIPTION,
                knowsAbout: [
                  "Web Development",
                  "AI Automation",
                  "Data Analysis",
                  "Prompt Engineering",
                  "Brand Identity",
                  "React",
                  "Next.js",
                  "TypeScript",
                ],
                sameAs: [
                  "https://www.linkedin.com/in/mayank-dhodi/",
                  "https://github.com/UMDhodi",
                  "https://www.instagram.com/mayvxnk/",
                  "https://ko-fi.com/mayankdhodi",
                ],
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "IN",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Mayank Dhodi Portfolio",
                url: SITE_URL,
                description: SITE_DESCRIPTION,
                author: {
                  "@type": "Person",
                  name: "Mayank Dhodi",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "ProfilePage",
                mainEntity: {
                  "@type": "Person",
                  name: "Mayank Dhodi",
                  url: SITE_URL,
                },
                dateCreated: "2026-01-01",
                dateModified: new Date().toISOString().split("T")[0],
              },
            ]),
          }}
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