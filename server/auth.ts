import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { createHash } from "crypto";
import { users } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const crypto = {
  hash: (password: string) => {
    return createHash('sha256').update(password).digest('hex');
  },
  compare: (suppliedPassword: string, storedPassword: string) => {
    const hashedSupplied = createHash('sha256').update(suppliedPassword).digest('hex');
    return hashedSupplied === storedPassword;
  },
};

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password: string;
      is_admin: boolean;
      created_at: string;
    }
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "sistema-stakeholders-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    },
    store: new MemoryStore({
      checkPeriod: 86400000, // limpiar entradas expiradas cada 24h
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      ...sessionSettings.cookie,
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Intento de login para usuario: ${username}`);

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          console.log('Usuario no encontrado');
          return done(null, false, { message: "Usuario incorrecto" });
        }

        console.log('Usuario encontrado, verificando contraseña...');
        const isMatch = crypto.compare(password, user.password);

        if (!isMatch) {
          console.log('Contraseña incorrecta');
          return done(null, false, { message: "Contraseña incorrecta" });
        }

        console.log('Login exitoso');
        return done(null, user);
      } catch (err) {
        console.error('Error en estrategia local:', err);
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

  app.post("/api/login", (req, res, next) => {
    console.log('Datos de login recibidos:', { username: req.body.username });

    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ 
        ok: false,
        message: "Usuario y contraseña son requeridos" 
      });
    }

    passport.authenticate("local", (err: any, user: Express.User | false, info?: IVerifyOptions) => {
      if (err) {
        console.error('Error en autenticación:', err);
        return next(err);
      }

      if (!user) {
        return res.status(400).json({ 
          ok: false,
          message: info?.message || "Error de inicio de sesión" 
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error('Error en login:', err);
          return next(err);
        }

        return res.json({
          ok: true,
          message: "Inicio de sesión exitoso",
          user: {
            id: user.id,
            username: user.username,
            is_admin: user.is_admin
          }
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ 
          ok: false,
          message: "Error al cerrar sesión" 
        });
      }
      res.json({ 
        ok: true,
        message: "Sesión cerrada exitosamente" 
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const { id, username, is_admin } = req.user;
      return res.json({ id, username, is_admin });
    }
    res.status(401).json({ 
      ok: false,
      message: "No ha iniciado sesión" 
    });
  });
  app.post("/api/register", async (req, res, next) => {
    try {
      // Verificar si el usuario actual es admin
      if (!req.user?.is_admin) {
        return res.status(403).send("Solo los administradores pueden crear usuarios");
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
        })
        .returning();

      return res.json({
        message: "Usuario creado exitosamente",
        user: { id: newUser.id, username: newUser.username, is_admin: newUser.is_admin },
      });
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/users", async (req, res) => {
    if (!req.user?.is_admin) {
      return res.status(403).send("Acceso denegado");
    }

    try {
      const usersList = await db
        .select({
          id: users.id,
          username: users.username,
          is_admin: users.is_admin,
          created_at: users.created_at,
        })
        .from(users);

      res.json(usersList);
    } catch (error) {
      res.status(500).send("Error al obtener la lista de usuarios");
    }
  });
}