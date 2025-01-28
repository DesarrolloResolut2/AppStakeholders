import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    if (!hashedPassword || !salt) {
      return false;
    }
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

export async function createInitialAdminUser() {
  try {
    // Eliminar usuario admin existente si existe
    await db.delete(users).where(eq(users.username, "admin"));

    // Crear nuevo usuario admin
    const hashedPassword = await crypto.hash("admin123");
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Usuario administrador inicial creado/actualizado");
  } catch (error) {
    console.error("Error al crear usuario admin:", error);
  }
}

// Middleware para verificar si el usuario es administrador
const requireAdmin = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Se requieren permisos de administrador" });
  }
  next();
};

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "stakeholder-management-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Usuario no encontrado." });
        }

        const isMatch = await crypto.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Contraseña incorrecta." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Rutas de autenticación
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send(info.message ?? "Error de inicio de sesión");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.json({
          message: "Inicio de sesión exitoso",
          user: { id: user.id, username: user.username, role: user.role },
        });
      });
    })(req, res, next);
  });

  // Ruta para crear nuevos usuarios (solo admin)
  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const { username, password, role = "user" } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
      }

      // Verificar si el usuario ya existe
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ error: "El nombre de usuario ya existe" });
      }

      // Crear nuevo usuario
      const hashedPassword = await crypto.hash(password);
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          role,
        })
        .returning();

      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res.status(500).json({ error: "Error al crear usuario" });
    }
  });

  // Obtener lista de usuarios (solo admin)
  app.get("/api/users", requireAdmin, async (_req, res) => {
    try {
      const usersList = await db.select().from(users);
      // No enviamos las contraseñas
      const safeUsers = usersList.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  });

  // Añadir endpoint para eliminar usuario (solo admin)
  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      // No permitir eliminar al usuario admin principal
      const [userToDelete] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userToDelete) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      if (userToDelete.username === "admin") {
        return res.status(403).json({ error: "No se puede eliminar el usuario administrador principal" });
      }

      await db.delete(users).where(eq(users.id, userId));
      res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  });

  // Añadir endpoint para actualizar usuario (solo admin)
  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { username, password, role } = req.body;

      // No permitir cambios en el usuario admin principal
      const [userToUpdate] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userToUpdate) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      if (userToUpdate.username === "admin" && username !== "admin") {
        return res.status(403).json({ error: "No se puede modificar el nombre del usuario administrador principal" });
      }

      // Verificar si el nuevo username ya existe (si se está cambiando)
      if (username && username !== userToUpdate.username) {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (existingUser) {
          return res.status(400).json({ error: "El nombre de usuario ya existe" });
        }
      }

      // Construir objeto de actualización
      const updateData: Partial<typeof userToUpdate> = {};
      if (username) updateData.username = username;
      if (role) updateData.role = role as "admin" | "user";
      if (password) {
        updateData.password = await crypto.hash(password);
      }

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      res.json({
        message: "Usuario actualizado exitosamente",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Error al cerrar sesión");
      }
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("No autenticado");
  });

  // Añadir endpoint para que el usuario cambie su propia contraseña
  app.put("/api/user/password", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Se requieren ambas contraseñas" });
    }

    const userId = req.user!.id;

    (async () => {
      try {
        // Verificar la contraseña actual
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        const isMatch = await crypto.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: "Contraseña actual incorrecta" });
        }

        // Actualizar a la nueva contraseña
        const hashedPassword = await crypto.hash(newPassword);
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, userId));

        res.json({ message: "Contraseña actualizada exitosamente" });
      } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ error: "Error al cambiar la contraseña" });
      }
    })();
  });
}