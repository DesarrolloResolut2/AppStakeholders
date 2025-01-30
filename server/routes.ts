import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "../db";
import { provincias, stakeholders, tags, stakeholderTags } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  // Configurar autenticación antes de las rutas
  setupAuth(app);

  // Middleware para verificar autenticación
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }
    next();
  };

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

  app.post("/api/provincias", requireAuth, async (req, res) => {
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

  // Stakeholders routes con autenticación
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

  app.post("/api/stakeholders", requireAuth, async (req, res) => {
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

  app.put("/api/stakeholders/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/stakeholders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(stakeholders).where(eq(stakeholders.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar stakeholder" });
    }
  });

  app.delete("/api/provincias/:id", requireAuth, async (req, res) => {
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

  // Nuevas rutas para tags
  app.get("/api/tags", requireAuth, async (_req, res) => {
    try {
      const result = await db.query.tags.findMany();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tags" });
    }
  });

  app.post("/api/tags", requireAuth, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "El nombre del tag es requerido" });
      }

      const result = await db.insert(tags)
        .values({ name: name.trim() })
        .returning();

      res.status(201).json(result[0]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique constraint')) {
        res.status(400).json({ error: "Ya existe un tag con ese nombre" });
      } else {
        res.status(500).json({ error: "Error al crear tag" });
      }
    }
  });

  app.put("/api/tags/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "El nombre del tag es requerido" });
      }

      const result = await db.update(tags)
        .set({ name: name.trim() })
        .where(eq(tags.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Tag no encontrado" });
      }

      res.json(result[0]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique constraint')) {
        res.status(400).json({ error: "Ya existe un tag con ese nombre" });
      } else {
        res.status(500).json({ error: "Error al actualizar tag" });
      }
    }
  });

  app.delete("/api/tags/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(tags).where(eq(tags.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar tag" });
    }
  });

  // Rutas para asignar/desasignar tags a stakeholders
  app.post("/api/stakeholders/:id/tags", requireAuth, async (req, res) => {
    try {
      const stakeholderId = parseInt(req.params.id);
      const { tagIds } = req.body;

      if (!Array.isArray(tagIds)) {
        return res.status(400).json({ error: "tagIds debe ser un array" });
      }

      // Eliminar asignaciones existentes
      await db.delete(stakeholderTags)
        .where(eq(stakeholderTags.stakeholder_id, stakeholderId));

      // Crear nuevas asignaciones
      if (tagIds.length > 0) {
        await db.insert(stakeholderTags)
          .values(tagIds.map(tagId => ({
            stakeholder_id: stakeholderId,
            tag_id: tagId
          })));
      }

      const result = await db.query.stakeholders.findFirst({
        where: eq(stakeholders.id, stakeholderId),
        with: {
          tags: {
            with: {
              tag: true
            }
          }
        }
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al asignar tags" });
    }
  });

  // Obtener stakeholders con filtro por tags
  app.get("/api/stakeholders", requireAuth, async (req, res) => {
    try {
      const { tags: tagIds } = req.query;
      let result;

      if (tagIds && Array.isArray(tagIds)) {
        const parsedTagIds = tagIds.map(id => parseInt(id as string));

        // Obtener stakeholders que tienen todos los tags especificados
        const stakeholderIds = await db
          .select({ stakeholderId: stakeholderTags.stakeholder_id })
          .from(stakeholderTags)
          .where(inArray(stakeholderTags.tag_id, parsedTagIds))
          .groupBy(stakeholderTags.stakeholder_id)
          .having({ count: sql`count(*)`.eq(parsedTagIds.length) });

        result = await db.query.stakeholders.findMany({
          where: inArray(stakeholders.id, stakeholderIds.map(s => s.stakeholderId)),
          with: {
            tags: {
              with: {
                tag: true
              }
            }
          }
        });
      } else {
        result = await db.query.stakeholders.findMany({
          with: {
            tags: {
              with: {
                tag: true
              }
            }
          }
        });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener stakeholders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}