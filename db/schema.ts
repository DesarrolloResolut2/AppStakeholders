import { pgTable, text, serial, integer, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<"admin" | "user">().notNull().default("user"),
});

export const provincias = pgTable("provincias", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
});

export const stakeholders = pgTable("stakeholders", {
  id: serial("id").primaryKey(),
  provincia_id: integer("provincia_id").references(() => provincias.id).notNull(),
  nombre: text("nombre").notNull(),
  datos_contacto: jsonb("datos_contacto").$type<{
    linkedin?: string;
    organizacion_principal?: string;
    otras_organizaciones?: string;
    persona_contacto?: string;
    email?: string;
    website?: string;
    telefono?: string;
  }>(),
  objetivos_generales: text("objetivos_generales"),
  intereses_expectativas: text("intereses_expectativas"),
  nivel_influencia: text("nivel_influencia").$type<string>().notNull(),
  nivel_interes: text("nivel_interes").$type<string>().notNull(),
  recursos: text("recursos"),
  expectativas_comunicacion: text("expectativas_comunicacion"),
  relaciones: text("relaciones"),
  riesgos_conflictos: text("riesgos_conflictos"),
  datos_especificos_linkedin: jsonb("datos_especificos_linkedin").$type<{
    about_me?: string;
    headline?: string;
    experiencia?: string;
    formacion?: string;
    otros_campos?: string;
  }>(),
});

// Nueva tabla de tags
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Nueva tabla de relación muchos a muchos entre stakeholders y tags
export const stakeholderTags = pgTable("stakeholder_tags", {
  stakeholder_id: integer("stakeholder_id")
    .references(() => stakeholders.id, { onDelete: "cascade" })
    .notNull(),
  tag_id: integer("tag_id")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
}, (table) => {
  return {
    pk: primaryKey(table.stakeholder_id, table.tag_id),
  }
});

export const provinciasRelations = relations(provincias, ({ many }) => ({
  stakeholders: many(stakeholders),
}));

export const stakeholdersRelations = relations(stakeholders, ({ one, many }) => ({
  provincia: one(provincias, {
    fields: [stakeholders.provincia_id],
    references: [provincias.id],
  }),
  tags: many(stakeholderTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  stakeholders: many(stakeholderTags),
}));

export const stakeholderTagsRelations = relations(stakeholderTags, ({ one }) => ({
  stakeholder: one(stakeholders, {
    fields: [stakeholderTags.stakeholder_id],
    references: [stakeholders.id],
  }),
  tag: one(tags, {
    fields: [stakeholderTags.tag_id],
    references: [tags.id],
  }),
}));

export const insertProvinciaSchema = createInsertSchema(provincias);
export const selectProvinciaSchema = createSelectSchema(provincias);

export const insertStakeholderSchema = createInsertSchema(stakeholders);
export const selectStakeholderSchema = createSelectSchema(stakeholders);

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Schemas para tags
export const insertTagSchema = createInsertSchema(tags);
export const selectTagSchema = createSelectSchema(tags);

export const insertStakeholderTagSchema = createInsertSchema(stakeholderTags);
export const selectStakeholderTagSchema = createSelectSchema(stakeholderTags);