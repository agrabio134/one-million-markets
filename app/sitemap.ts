import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/markets", "/launchpad", "/dex", "/perpetuals", "/risk"].map((p) => ({ url: `https://1m.markets${p}`, changeFrequency: "weekly" }));
}
