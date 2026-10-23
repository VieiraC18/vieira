import { cache } from "react";
import { databaseConfigured, query } from "@/lib/db";
import { defaultServices, defaultSettings } from "@/lib/server/defaults";
import {
  settingsSchema,
  type PublicSettings,
  type PublicProject,
  type PublicService,
} from "@/lib/validators";

export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  if (!databaseConfigured()) return { ...defaultSettings };
  try {
    const rows = await query<{ key: string; value: unknown }>(
      "SELECT key,value FROM site_settings",
    );
    const parsed = settingsSchema.safeParse({
      ...defaultSettings,
      ...Object.fromEntries(rows.map((r) => [r.key, r.value])),
    });
    return parsed.success ? parsed.data : { ...defaultSettings };
  } catch {
    console.error("[public] Settings database unavailable");
    return { ...defaultSettings };
  }
});
/** Stored content can replace only the known shape, so a malformed CMS record cannot break a page. */
function mergeShape(fallback: unknown, value: unknown, depth = 0): unknown {
  if (depth > 12) return fallback;
  if (Array.isArray(fallback))
    return Array.isArray(value)
      ? value
          .slice(0, 100)
          .map((item) =>
            fallback.length ? mergeShape(fallback[0], item, depth + 1) : item,
          )
      : fallback;
  if (fallback && typeof fallback === "object")
    return Object.fromEntries(
      Object.entries(fallback).map(([key, current]) => [
        key,
        mergeShape(
          current,
          value && typeof value === "object"
            ? (value as Record<string, unknown>)[key]
            : undefined,
          depth + 1,
        ),
      ]),
    );
  return typeof value === typeof fallback && value !== null ? value : fallback;
}
export async function getContent<T>(key: string, fallback: T): Promise<T> {
  if (!databaseConfigured()) return fallback;
  try {
    const [row] = await query<{ value: unknown }>(
      "SELECT value FROM content_sections WHERE key=$1",
      [key],
    );
    return row ? (mergeShape(fallback, row.value) as T) : fallback;
  } catch {
    console.error("[public] Content database unavailable");
    return fallback;
  }
}
export const projectSelect = `SELECT p.*,COALESCE((SELECT jsonb_agg(i.url ORDER BY i."order") FROM project_images i WHERE i.project_id=p.id),'[]'::jsonb) AS gallery,COALESCE((SELECT jsonb_agg(t.name ORDER BY t.name) FROM project_technologies pt JOIN technologies t ON t.id=pt.technology_id WHERE pt.project_id=p.id),'[]'::jsonb) AS technologies FROM projects p`;
export async function getPublicProjects(): Promise<PublicProject[]> {
  if (!databaseConfigured()) return [];
  try {
    return (
      await query<PublicProject>(
        `${projectSelect} WHERE p.published=true ORDER BY p."order",p.created_at DESC`,
      )
    ).map((p) => ({ ...p, client: p.hideClient ? "" : p.client }));
  } catch {
    console.error("[public] Projects database unavailable");
    return [];
  }
}
export async function getPublicServices(): Promise<PublicService[]> {
  if (!databaseConfigured()) return defaultServices;
  try {
    return await query<PublicService>(
      'SELECT * FROM services WHERE active=true ORDER BY "order",name',
    );
  } catch {
    console.error("[public] Services database unavailable");
    return defaultServices;
  }
}
