import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./db.js";
import authRoutes from "./routes/auth.js";
import holdingsRoutes from "./routes/holdings.js";
import shareRoutes from "./routes/share.js";
import accessRequestRoutes from "./routes/accessRequests.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "money-book-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/holdings", holdingsRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/access-requests", accessRequestRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Money Book API running on http://localhost:${PORT}`);
});
