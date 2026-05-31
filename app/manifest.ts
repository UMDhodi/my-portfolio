import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mayank Dhodi — Full-Stack Developer & AI Engineer",
    short_name: "MK.",
    description:
      "Portfolio of Mayank Dhodi Certified Data Analyst, Full-Stack Developer, and Prompt Engineer.",
    start_url: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
