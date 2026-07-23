import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workEvents = sqliteTable(
  "work_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerEmail: text("owner_email").notNull(),
    occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    project: text("project").notNull(),
    activity: text("activity").notNull(),
    actor: text("actor", { enum: ["human", "ai", "pair"] }).notNull(),
    capability: text("capability").notNull(),
    outcome: text("outcome", {
      enum: ["accepted", "rework", "rejected", "pending"],
    }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    qualityScore: integer("quality_score"),
    costCents: integer("cost_cents").notNull().default(0),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("work_events_owner_date_idx").on(table.ownerEmail, table.occurredAt),
    index("work_events_owner_capability_idx").on(table.ownerEmail, table.capability),
  ],
);
