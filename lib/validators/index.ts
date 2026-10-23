import { z } from "zod";

const short = z.string().trim().max(200);
const paragraph = z.string().trim().max(12000);
export const uuidSchema = z.string().uuid();
/** Zod 4 applies defaults inside optional fields. PATCH must keep only supplied keys. */
export function parsePatch<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  input: Record<string, unknown>,
): T {
  const parsed = schema.parse(input);
  return Object.fromEntries(
    Object.entries(parsed).filter(([key]) => Object.hasOwn(input, key)),
  ) as T;
}
function safeUrl(value: string, allowLocal: boolean) {
  if (!value) return true;
  if (/[\\\u0000-\u0020\u007f]/.test(value)) return false;
  if (allowLocal && value.startsWith("/") && !value.startsWith("//"))
    return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => safeUrl(v, true), "Use uma URL HTTPS ou um caminho local.");
const externalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => safeUrl(v, false), "Use uma URL HTTPS.");
export const statusSchema = z.enum([
  "new",
  "analyzing",
  "contacted",
  "meeting",
  "proposal",
  "negotiation",
  "closed",
  "lost",
  "archived",
]);
export const passwordSchema = z
  .string()
  .min(12, "Use uma senha com pelo menos 12 caracteres.")
  .max(72, "A senha deve ter até 72 caracteres.")
  .refine(
    (v) => Buffer.byteLength(v, "utf8") <= 72,
    "A senha deve ter até 72 bytes.",
  );
export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();
export const leadSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    company: short.default(""),
    email: z.string().trim().toLowerCase().email().max(254),
    whatsapp: z
      .string()
      .trim()
      .transform((v) => v.replace(/[^\d+]/g, ""))
      .refine(
        (v) => /^\+?\d{10,15}$/.test(v),
        "Informe um telefone válido com DDD.",
      ),
    needs: z.array(z.string().trim().min(2).max(120)).min(1).max(15),
    problem: z.string().trim().min(12).max(8000),
    currentProcess: z.string().trim().min(10).max(8000),
    manualWork: z.enum(["Sim", "Não", "Parcialmente", "Não sei"]),
    usesSpreadsheets: z.boolean(),
    hasSystem: z.boolean(),
    features: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
    priority: z.enum([
      "Pesquisando",
      "Quero começar em breve",
      "Prioritário",
      "Urgente",
    ]),
    budget: short.default(""),
    source: z.string().trim().max(500).default("direct"),
    utmSource: short.default(""),
    utmMedium: short.default(""),
    utmCampaign: short.default(""),
    utmTerm: short.default(""),
    utmContent: short.default(""),
    consent: z.literal(true, {
      error: "É necessário aceitar a política de privacidade.",
    }),
    idempotencyKey: uuidSchema,
    website: z.string().max(0).optional(),
  })
  .strict();
export function normalizeLead(
  input: Record<string, unknown>,
  key: string | null,
) {
  const utm = (
    input.utm && typeof input.utm === "object" ? input.utm : {}
  ) as Record<string, unknown>;
  const bool = (v: unknown) => (v === "Sim" ? true : v === "Não" ? false : v);
  return {
    name: input.name,
    company: input.company,
    email: input.email,
    whatsapp: input.whatsapp ?? input.phone,
    needs:
      input.needs ??
      (typeof input.need === "string"
        ? [
            input.need === "Outro" && input.otherNeed
              ? `Outro: ${input.otherNeed}`
              : input.need,
          ]
        : undefined),
    problem: input.problem,
    currentProcess: input.currentProcess,
    manualWork: input.manualWork,
    usesSpreadsheets: bool(input.usesSpreadsheets),
    hasSystem: bool(input.hasSystem),
    features: input.features,
    priority: input.priority,
    budget: input.budget ?? input.investment,
    source: input.source ?? input.origin ?? input.landingPage,
    utmSource: input.utmSource ?? utm.source,
    utmMedium: input.utmMedium ?? utm.medium,
    utmCampaign: input.utmCampaign ?? utm.campaign,
    utmTerm: input.utmTerm ?? utm.term,
    utmContent: input.utmContent ?? utm.content,
    consent: input.consent,
    idempotencyKey: input.idempotencyKey ?? key,
    website: input.website,
  };
}
export const projectSchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    slug: z
      .string()
      .min(2)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    client: short.default(""),
    hideClient: z.boolean().default(true),
    category: short.default("Software"),
    description: z.string().trim().min(10).max(3000),
    problem: paragraph.default(""),
    context: paragraph.default(""),
    analysis: paragraph.default(""),
    solution: paragraph.default(""),
    development: paragraph.default(""),
    result: paragraph.default(""),
    image: optionalUrl.default(""),
    url: externalUrl.default(""),
    gallery: z.array(optionalUrl).max(20).default([]),
    technologies: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
    kind: z.enum(["concept", "technical", "client"]).default("concept"),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
    order: z.number().int().min(0).max(10000).default(0),
  })
  .strict();
export const serviceSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    slug: z
      .string()
      .min(2)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    summary: z.string().trim().min(10).max(600),
    description: paragraph.default(""),
    icon: z.string().max(60).default("Code2"),
    image: optionalUrl.default(""),
    order: z.number().int().min(0).max(10000).default(0),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
    seoTitle: short.default(""),
    seoDescription: z.string().max(350).default(""),
  })
  .strict();
export const userSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    password: passwordSchema,
    role: z.enum(["admin", "editor"]).default("editor"),
    active: z.boolean().default(true),
  })
  .strict();
export const settingsSchema = z
  .object({
    companyName: z.literal("VIEIRA SYSTEMS"),
    slogan: z.string().max(300),
    siteUrl: externalUrl,
    email: z.union([z.literal(""), z.string().trim().email().max(254)]),
    whatsapp: z
      .string()
      .trim()
      .max(20)
      .refine(
        (v) => !v || /^\+?\d{10,15}$/.test(v),
        "Use DDI + DDD + número, somente dígitos.",
      ),
    instagram: externalUrl,
    linkedin: externalUrl,
    github: externalUrl,
    seoTitle: short,
    seoDescription: z.string().max(350),
    googleAnalyticsId: z.string().regex(/^(?:G-[A-Z0-9]+)?$/),
    googleTagManagerId: z.string().regex(/^(?:GTM-[A-Z0-9]+)?$/),
    metaPixelId: z.string().regex(/^\d{0,30}$/),
    budgetEnabled: z.boolean(),
    budgetRanges: z.array(z.string().trim().min(1).max(100)).max(12),
  })
  .strict();
export type PublicSettings = z.infer<typeof settingsSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type PublicProject = ProjectInput & { id: string; createdAt?: string };
export type PublicService = ServiceInput & { id: string };
const cmsKeys = [
  "hero",
  "about",
  "footer",
  "contact",
  "solutions",
  "differentials",
  "faq",
  "seo",
  "page:servicos",
  "page:solucoes",
  "page:automacao",
  "page:dados",
  "page:inteligencia-artificial",
  "page:consultoria",
  "page:assessoria",
] as const;
function boundedJson(depth: number): z.ZodType<unknown> {
  const primitive = z.union([
    z.string().max(16000),
    z.number(),
    z.boolean(),
    z.null(),
  ]);
  if (depth === 0) return primitive;
  return z.union([
    primitive,
    z.array(boundedJson(depth - 1)).max(100),
    z.record(
      z
        .string()
        .max(100)
        .refine((k) => !["__proto__", "constructor", "prototype"].includes(k)),
      boundedJson(depth - 1),
    ),
  ]);
}
const safeJson = boundedJson(6);
export const contentSchema = z
  .object({ key: z.enum(cmsKeys), value: safeJson })
  .strict();
