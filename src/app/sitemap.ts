import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const now = new Date();

  // Marketing pages — public, indexable.
  const staticEntries: MetadataRoute.Sitemap = [
    "",
    "/membresia",
    "/terminos",
    "/privacidad",
    "/cookies",
    "/login",
    "/registro",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : p === "/membresia" ? 0.9 : 0.4,
  }));

  return staticEntries;
}
