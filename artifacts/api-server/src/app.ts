import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import authRouter from "./routes/auth";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env["SESSION_SECRET"] ?? "vocpos-fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  }),
);

// Public auth routes — no auth required
app.use("/api", authRouter);

// Auth guard — protect all other /api routes
app.use("/api", (req: Request, res: Response, next: NextFunction): void => {
  const publicPaths = ["/healthz"];
  if (publicPaths.some((p) => req.path === p || req.path.startsWith(p))) {
    next(); return;
  }
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "Unauthorized" }); return;
  }
  next();
});

app.use("/api", router);

export default app;
