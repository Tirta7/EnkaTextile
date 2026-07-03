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
app.use(express.json({ limit: "5mb" }));
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
  const publicPaths = ["/healthz", "/settings/manifest.json"];
  if (publicPaths.some((p) => req.path === p || req.path.startsWith(p))) {
    next(); return;
  }
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "Unauthorized" }); return;
  }
  next();
});

app.use("/api", router);

// Serve static frontend files in production
import path from "path";
if (process.env.NODE_ENV === "production") {
  const publicPath = path.resolve(process.cwd(), "../tmcpos/dist/public");
  app.use(express.static(publicPath));
  
  // SPA fallback
  app.use((req: Request, res: Response, next: NextFunction) => {
    const isFileRequest = req.path.match(/\.[a-zA-Z0-9]+$/);
    if (req.method === "GET" && !req.path.startsWith("/api") && req.accepts('html') && !isFileRequest) {
      res.sendFile(path.resolve(publicPath, "index.html"));
    } else {
      next();
    }
  });
}

export default app;
