import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SEED } from "@/lib/seed";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<[string, number]> = [
    ["", 1],
    ["/garden", 0.9],
    ["/bury", 0.9],
    ["/salvage", 0.7],
    ["/insights", 0.7],
    ["/contact", 0.5],
    ["/privacy", 0.3],
    ["/terms", 0.3],
  ];
  return [
    ...routes.map(([path, priority]) => ({ url: `${SITE.url}${path}`, lastModified: now, priority })),
    ...SEED.map((p) => ({ url: `${SITE.url}/garden/${p.id}`, lastModified: now, priority: 0.5 })),
  ];
}
