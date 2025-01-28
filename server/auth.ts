import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, type User } from "../db/schema";
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
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

declare global {
  namespace Express {
    // Extender la interfaz User de Express con nuestro tipo User
    interface User extends Omit<User, keyof Express.User> {}
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "porygon-supremacy",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
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
          return done(null, false, { message: "Usuario incorrecto." });
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

  passport.serializeUser((user, done) => {
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

  app.post("/api/register", async (req, res, next) => {
    try {
      // Verificar si existe algún usuario en el sistema
      const existingUsers = await db.select().from(users);
      const isFirstUser = existingUsers.length === 0;

      // Solo permitir registro si es el primer usuario (que será admin) o si el usuario actual es admin
      if (!isFirstUser && (!req.user || req.user.role !== "admin")) {
        return res.status(403).send("Solo los administradores pueden registrar nuevos usuarios");
      }

      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .send("Datos inválidos: " + result.error.issues.map(i => i.message).join(", "));
      }

      const { username, password } = result.data;

      // Verificar si el usuario ya existe
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("El nombre de usuario ya existe");
      }

      // Hash de la contraseña
      const hashedPassword = await crypto.hash(password);

      // Crear el nuevo usuario
      const [newUser] = await db
        .insert(users)
        .values({
          ...result.data,
          password: hashedPassword,
          // Si es el primer usuario, asignarle rol de admin
          role: isFirstUser ? "admin" : result.data.role || "user",
        })
        .returning();

      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: { id: newUser.id, username: newUser.username, role: newUser.role },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send("Datos inválidos: " + result.error.issues.map(i => i.message).join(", "));
    }

    const cb = (err: any, user: Express.User, info: IVerifyOptions) => {
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
    };
    passport.authenticate("local", cb)(req, res, next);
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

    res.status(401).send("No has iniciado sesión");
  });

  // Rutas de administración de usuarios
  app.get("/api/users", async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).send("Acceso denegado");
    }

    try {
      const usersList = await db.select().from(users);
      res.json(usersList.map(u => ({ id: u.id, username: u.username, role: u.role })));
    } catch (error) {
      res.status(500).send("Error al obtener la lista de usuarios");
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).send("Acceso denegado");
    }

    const userId = parseInt(req.params.id);
    const { username, password, role } = req.body;

    try {
      const updateData: any = {};
      if (username) updateData.username = username;
      if (password) updateData.password = await crypto.hash(password);
      if (role) updateData.role = role;

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      res.json({
        message: "Usuario actualizado exitosamente",
        user: { id: updatedUser.id, username: updatedUser.username, role: updatedUser.role },
      });
    } catch (error) {
      res.status(500).send("Error al actualizar el usuario");
    }
  });
}