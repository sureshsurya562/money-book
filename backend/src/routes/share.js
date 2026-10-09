import { Router } from "express";
import db from "../db.js";
import { CATEGORIES } from "../categories.js";
import { mapHolding, summarize } from "./holdings.js";

const router = Router();

router.get("/:token", (req, res) => {
  const user = db
    .prepare("SELECT * FROM users WHERE share_token = ? AND share_enabled = 1")
    .get(req.params.token);

  if (!user) {
    return res.status(404).json({ error: "Shared portfolio not found or sharing is disabled" });
  }

  const rows = db
    .prepare(
      "SELECT * FROM holdings WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC"
    )
    .all(user.id);

  const holdings = rows.map(mapHolding);
  const summary = summarize(holdings);

  res.json({
    ownerName: user.name,
    holdings,
    summary,
    categories: CATEGORIES,
    sharedAt: new Date().toISOString(),
  });
});

export default router;
