import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  insertStatement,
  query,
  transaction,
  updateStatement,
  type Statement,
} from "@/lib/db";
import { api, ApiError, json, readJson } from "@/lib/security/http";
import { audited } from "@/lib/server/mutations";
import { projectSelect } from "@/lib/server/public";
import { parsePatch, projectSchema, uuidSchema } from "@/lib/validators";

function relations(
  id: string,
  gallery?: string[],
  technologies?: string[],
): Statement[] {
  const statements: Statement[] = [];
  if (gallery !== undefined) {
    statements.push({
      text: "DELETE FROM project_images WHERE project_id=$1",
      values: [id],
    });
    gallery.filter(Boolean).forEach((url, order) =>
      statements.push({
        text: 'INSERT INTO project_images (project_id,url,"order") VALUES ($1,$2,$3)',
        values: [id, url, order],
      }),
    );
  }
  if (technologies !== undefined) {
    statements.push({
      text: "DELETE FROM project_technologies WHERE project_id=$1",
      values: [id],
    });
    for (const name of new Set(technologies)) {
      statements.push({
        text: "INSERT INTO technologies (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        values: [name],
      });
      statements.push({
        text: "INSERT INTO project_technologies (project_id,technology_id) SELECT $1,id FROM technologies WHERE name=$2",
        values: [id, name],
      });
    }
  }
  return statements;
}
export const GET = api(async (request) => {
  await requireAdmin(request);
  const items = await query(
    `${projectSelect} ORDER BY p."order",p.created_at DESC`,
  );
  return json({ items, total: items.length });
});
export const POST = api(async (request) => {
  const actor = await requireAdmin(request);
  const { gallery, technologies, ...input } = projectSchema.parse(
    await readJson(request),
  );
  const id = randomUUID();
  await transaction([
    audited(
      insertStatement("projects", { id, ...input }),
      actor.id,
      "create",
      "project",
    ),
    ...relations(id, gallery, technologies),
  ]);
  const [item] = await query(`${projectSelect} WHERE p.id=$1`, [id]);
  return json({ item }, 201);
});
export const PATCH = api(async (request) => {
  const actor = await requireAdmin(request);
  const { id, gallery, technologies, ...input } = parsePatch(
    projectSchema.partial().extend({ id: uuidSchema }).strict(),
    await readJson(request),
  );
  if (
    !Object.keys(input).length &&
    gallery === undefined &&
    technologies === undefined
  )
    throw new ApiError(422, "Informe os campos que deseja alterar.");
  const [existing] = await query("SELECT id FROM projects WHERE id=$1", [id]);
  if (!existing) throw new ApiError(404, "Projeto não encontrado.");
  const update = Object.keys(input).length
    ? updateStatement("projects", id, input)
    : {
        text: "UPDATE projects SET updated_at=now() WHERE id=$1 RETURNING *",
        values: [id],
      };
  await transaction([
    audited(update, actor.id, "update", "project"),
    ...relations(id, gallery, technologies),
  ]);
  const [item] = await query(`${projectSelect} WHERE p.id=$1`, [id]);
  return json({ item });
});
export const PUT = PATCH;
export const DELETE = api(async (request) => {
  const actor = await requireAdmin(request);
  const { id } = z
    .object({ id: uuidSchema })
    .strict()
    .parse(await readJson(request));
  const statement = audited(
    { text: "DELETE FROM projects WHERE id=$1 RETURNING id", values: [id] },
    actor.id,
    "delete",
    "project",
  );
  if (!(await query(statement.text, statement.values)).length)
    throw new ApiError(404, "Projeto não encontrado.");
  return json({ ok: true });
});
