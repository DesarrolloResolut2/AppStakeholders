import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

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
    email?: string;
  }>(),
  objetivos_generales: text("objetivos_generales"),
  intereses_expectativas: text("intereses_expectativas"),
  nivel_influencia: integer("nivel_influencia").notNull(),
  nivel_interes: integer("nivel_interes").notNull(),
  recursos: text("recursos"),
  expectativas_comunicacion: text("expectativas_comunicacion"),
  relaciones: text("relaciones"),
  riesgos_conflictos: text("riesgos_conflictos"),
  datos_especificos_linkedin: jsonb("datos_especificos_linkedin").$type<{
    cargo?: string;
    empresa?: string;
    industria?: string;
  }>(),
});

export const provinciasRelations = relations(provincias, ({ many }) => ({
  stakeholders: many(stakeholders),
}));

export const stakeholdersRelations = relations(stakeholders, ({ one }) => ({
  provincia: one(provincias, {
    fields: [stakeholders.provincia_id],
    references: [provincias.id],
  }),
}));

export const insertProvinciaSchema = createInsertSchema(provincias);
export const selectProvinciaSchema = createSelectSchema(provincias);

export const insertStakeholderSchema = createInsertSchema(stakeholders);
export const selectStakeholderSchema = createSelectSchema(stakeholders);
