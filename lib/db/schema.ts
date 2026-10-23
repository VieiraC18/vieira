import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "editor"]);
export const leadStatus = pgEnum("lead_status", [
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
const created = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updated = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole().notNull().default("editor"),
  active: boolean().notNull().default(true),
  createdAt: created(),
  updatedAt: updated(),
});
export const sessions = pgTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: created(),
  },
  (t) => [
    index("sessions_user_idx").on(t.userId),
    index("sessions_expiry_idx").on(t.expiresAt),
  ],
);
export const siteSettings = pgTable("site_settings", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: updated(),
});
export const contentSections = pgTable("content_sections", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: updated(),
});
export const categories = pgTable("categories", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
});
export const technologies = pgTable("technologies", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
});
export const services = pgTable(
  "services",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    summary: text().notNull(),
    description: text().notNull().default(""),
    icon: text().notNull().default("Code2"),
    image: text().notNull().default(""),
    order: integer().notNull().default(0),
    featured: boolean().notNull().default(false),
    active: boolean().notNull().default(true),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    createdAt: created(),
    updatedAt: updated(),
  },
  (t) => [index("services_public_idx").on(t.active, t.order)],
);
export const projects = pgTable(
  "projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    slug: text().notNull().unique(),
    client: text().notNull().default(""),
    hideClient: boolean("hide_client").notNull().default(true),
    category: text().notNull().default("Software"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    description: text().notNull(),
    problem: text().notNull().default(""),
    context: text().notNull().default(""),
    analysis: text().notNull().default(""),
    solution: text().notNull().default(""),
    development: text().notNull().default(""),
    result: text().notNull().default(""),
    image: text().notNull().default(""),
    url: text().notNull().default(""),
    kind: text().notNull().default("concept"),
    featured: boolean().notNull().default(false),
    published: boolean().notNull().default(false),
    order: integer().notNull().default(0),
    createdAt: created(),
    updatedAt: updated(),
  },
  (t) => [index("projects_public_idx").on(t.published, t.order)],
);
export const projectImages = pgTable(
  "project_images",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    url: text().notNull(),
    alt: text().notNull().default(""),
    order: integer().notNull().default(0),
  },
  (t) => [index("project_images_project_idx").on(t.projectId)],
);
export const projectTechnologies = pgTable(
  "project_technologies",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.technologyId] })],
);
export const leads = pgTable(
  "leads",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    company: text().notNull().default(""),
    email: text().notNull(),
    whatsapp: text().notNull(),
    needs: jsonb().$type<string[]>().notNull(),
    problem: text().notNull(),
    currentProcess: text("current_process").notNull(),
    manualWork: text("manual_work").notNull(),
    usesSpreadsheets: boolean("uses_spreadsheets").notNull(),
    hasSystem: boolean("has_system").notNull(),
    features: jsonb().$type<string[]>().notNull(),
    priority: text().notNull(),
    budget: text().notNull().default(""),
    status: leadStatus().notNull().default("new"),
    source: text().notNull().default("direct"),
    utmSource: text("utm_source").notNull().default(""),
    utmMedium: text("utm_medium").notNull().default(""),
    utmCampaign: text("utm_campaign").notNull().default(""),
    utmTerm: text("utm_term").notNull().default(""),
    utmContent: text("utm_content").notNull().default(""),
    consentAt: timestamp("consent_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    consentVersion: text("consent_version").notNull().default("2026-10"),
    idempotencyKey: uuid("idempotency_key").notNull().unique(),
    payloadHash: text("payload_hash").notNull(),
    createdAt: created(),
    updatedAt: updated(),
  },
  (t) => [
    index("leads_created_idx").on(t.createdAt),
    index("leads_status_idx").on(t.status),
    index("leads_source_idx").on(t.source),
  ],
);
export const leadNotes = pgTable(
  "lead_notes",
  {
    id: uuid().primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    body: text().notNull(),
    createdAt: created(),
  },
  (t) => [index("lead_notes_lead_idx").on(t.leadId)],
);
export const leadEvents = pgTable(
  "lead_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    type: text().notNull(),
    description: text().notNull(),
    metadata: jsonb().notNull().default({}),
    createdAt: created(),
  },
  (t) => [index("lead_events_lead_idx").on(t.leadId, t.createdAt)],
);
export const socialLinks = pgTable("social_links", {
  id: uuid().primaryKey().defaultRandom(),
  platform: text().notNull().unique(),
  url: text().notNull(),
  order: integer().notNull().default(0),
  active: boolean().notNull().default(true),
});
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text().notNull(),
    entity: text().notNull(),
    entityId: text("entity_id"),
    metadata: jsonb().notNull().default({}),
    createdAt: created(),
  },
  (t) => [index("audit_logs_created_idx").on(t.createdAt)],
);
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text().primaryKey(),
    count: integer().notNull().default(1),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("rate_limits_reset_idx").on(t.resetAt)],
);
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  notes: many(leadNotes),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
export const leadsRelations = relations(leads, ({ many }) => ({
  notes: many(leadNotes),
  events: many(leadEvents),
}));
export const notesRelations = relations(leadNotes, ({ one }) => ({
  lead: one(leads, { fields: [leadNotes.leadId], references: [leads.id] }),
  author: one(users, { fields: [leadNotes.authorId], references: [users.id] }),
}));
export const eventsRelations = relations(leadEvents, ({ one }) => ({
  lead: one(leads, { fields: [leadEvents.leadId], references: [leads.id] }),
}));
export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
  technologies: many(projectTechnologies),
}));
export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));
export const projectTechnologiesRelations = relations(
  projectTechnologies,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTechnologies.projectId],
      references: [projects.id],
    }),
    technology: one(technologies, {
      fields: [projectTechnologies.technologyId],
      references: [technologies.id],
    }),
  }),
);
