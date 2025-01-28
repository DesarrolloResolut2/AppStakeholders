import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "../db";
import { provincias, stakeholders } from "../db/schema";
import { eq } from "drizzle-orm";
import { setupAuth } from "./auth";

// Middleware para verificar autenticación
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "No ha iniciado sesión" });
};

// Middleware para verificar rol de administrador
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.is_admin) {
    return next();
  }
  res.status(403).json({ error: "Acceso denegado" });
};

export function registerRoutes(app: Express): Server {
  // Configurar autenticación
  setupAuth(app);

  // Provincias routes
  app.get("/api/provincias", requireAuth, async (_req, res) => {
    try {
      const result = await db.query.provincias.findMany({
        with: {
          stakeholders: true,
        },
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener provincias" });
    }
  });

  app.post("/api/provincias", requireAdmin, async (req, res) => {
    try {
      const { nombre } = req.body;
      console.log("Datos recibidos:", { nombre });

      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: "El nombre de la provincia es requerido y debe ser un texto válido" });
      }

      const nombreTrimmed = nombre.trim();

      const result = await db.insert(provincias)
        .values({ nombre: nombreTrimmed })
        .returning();

      console.log("Provincia creada:", result[0]);
      res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error detallado:", error);
      res.status(500).json({ 
        error: "Error al crear provincia",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Stakeholders routes
  app.get("/api/provincias/:id/stakeholders", requireAuth, async (req, res) => {
    try {
      const provinciaId = parseInt(req.params.id);
      const result = await db.query.stakeholders.findMany({
        where: eq(stakeholders.provincia_id, provinciaId),
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener stakeholders" });
    }
  });

  app.post("/api/stakeholders", requireAdmin, async (req, res) => {
    try {
      const stakeholder = req.body;
      console.log("Datos recibidos:", stakeholder);
      const result = await db.insert(stakeholders).values(stakeholder).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error detallado:", error);
      res.status(500).json({ 
        error: "Error al crear stakeholder",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.put("/api/stakeholders/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stakeholder = req.body;
      const result = await db
        .update(stakeholders)
        .set(stakeholder)
        .where(eq(stakeholders.id, id))
        .returning();
      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar stakeholder" });
    }
  });

  app.delete("/api/stakeholders/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(stakeholders).where(eq(stakeholders.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar stakeholder" });
    }
  });

  // Delete provincia
  app.delete("/api/provincias/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(stakeholders).where(eq(stakeholders.provincia_id, id));
      await db.delete(provincias).where(eq(provincias.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error al eliminar provincia:", error);
      res.status(500).json({ 
        error: "Error al eliminar provincia",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Export routes
  app.get("/api/provincias/:id/export", requireAuth, async (req, res) => {
    try {
      const provinciaId = parseInt(req.params.id);
      const provincia = await db.query.provincias.findFirst({
        where: eq(provincias.id, provinciaId),
        with: {
          stakeholders: true,
        },
      });
      res.json(provincia);
    } catch (error) {
      res.status(500).json({ error: "Error al exportar datos" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}