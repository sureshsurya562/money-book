import { Router } from "express";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { authRequired } from "../middleware.js";

const router = Router();

function normalizeMobile(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

router.post("/", (req, res) => {
  const name = String(req.body?.name || "").trim().slice(0, 80);
  const note = String(req.body?.note || "").trim().slice(0, 280);
  const mobile = normalizeMobile(req.body?.mobile);

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({
      error: "Enter a valid 10-digit Indian mobile number.",
    });
  }

  const recent = db
    .prepare(
      `SELECT id FROM access_requests
       WHERE mobile = ? AND created_at >= datetime('now', '-1 day')
       LIMIT 1`
    )
    .get(mobile);

  if (recent) {
    return res.status(409).json({
      error: "We already have a request from this number. We’ll get back to you soon.",
    });
  }

  const id = uuid();
  db.prepare(
    `INSERT INTO access_requests (id, name, mobile, note, status)
     VALUES (?, ?, ?, ?, 'pending')`
  ).run(id, name || null, mobile, note || null);

  res.status(201).json({
    ok: true,
    message: "Request saved. We’ll review it and get back to you.",
  });
});

router.get("/", authRequired, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, name, mobile, note, status, created_at AS createdAt
       FROM access_requests
       ORDER BY datetime(created_at) DESC
       LIMIT 200`
    )
    .all();
  res.json({ requests: rows });
});

export default router;