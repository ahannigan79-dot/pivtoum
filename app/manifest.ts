import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Winning in the Age of AI",
    short_name: "Winning",
    description: "Your community for staying ahead of AI — map your exposure, make your moves, win together.",
    start_url: "/hub",
    scope: "/",
    display: "standalone",
    background_color: "#FBFAF6",
    theme_color: "#FBFAF6",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
