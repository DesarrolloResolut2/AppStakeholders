import { pgTable, text, serial, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  is_admin: boolean("is_admin").notNull().default(false),
  created_at: text("created_at").notNull().$default(() => new Date().toISOString()),
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

export const provinciasRelations = relations(provincias, ({ many }) => ({
  stakeholders: many(stakeholders),
}));

export const stakeholdersRelations = relations(stakeholders, ({ one }) => ({
  provincia: one(provincias, {
    fields: [stakeholders.provincia_id],
    references: [provincias.id],
  }),
}));

// Schemas for validation - Actualizados para manejar login
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  is_admin: z.boolean().optional(),
  created_at: z.string().optional()
});

export const selectUserSchema = createSelectSchema(users);

export const insertProvinciaSchema = createInsertSchema(provincias);
export const selectProvinciaSchema = createSelectSchema(provincias);

export const insertStakeholderSchema = createInsertSchema(stakeholders);
export const selectStakeholderSchema = createSelectSchema(stakeholders);

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;