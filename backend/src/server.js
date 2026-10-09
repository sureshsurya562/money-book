import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import "./db.js";
import authRoutes from "./routes/auth.js";
import holdingsRoutes from "./routes/holdings.js";
import shareRoutes from "./routes/share.js";
import accessRequestRoutes from "./routes/accessRequests.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === "production";
const frontendDist = path.resolve(__dirname, "../../frontend/dist");

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "money-book-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/holdings", holdingsRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use("/api/admin", adminRoutes);

if (isProd) {
  app.use(express.static(frontendDist, { maxAge: "1h", index: false }));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Money Book running on http://0.0.0.0:${PORT}`);
});
