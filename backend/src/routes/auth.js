import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { authRequired } from "../middleware.js";
import { SEED_HOLDINGS } from "../seedData.js";

const router = Router();

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    jwtSecret(),
    { expiresIn: "30d" }
  );
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    shareEnabled: !!row.share_enabled,
    shareToken: row.share_token,
  };
}

function seedHoldingsForUser(userId) {
  const insert = db.prepare(`
    INSERT INTO holdings (
      id, user_id, category_id, name, platform,
      invested_amount, current_value, invested_date, notes, meta_json,
      is_protection, is_recurring, recurring_amount, recurring_frequency,
      cover_amount, sort_order
    ) VALUES (
      @id, @user_id, @category_id, @name, @platform,
      @invested_amount, @current_value, @invested_date, @notes, @meta_json,
      @is_protection, @is_recurring, @recurring_amount, @recurring_frequency,
      @cover_amount, @sort_order
    )
  `);

  const tx = db.transaction(() => {
    SEED_HOLDINGS.forEach((h, index) => {
      insert.run({
        id: uuid(),
        user_id: userId,
        category_id: h.category_id,
        name: h.name,
        platform: h.platform || null,
        invested_amount: h.invested_amount ?? 0,
        current_value: h.current_value ?? h.invested_amount ?? 0,
        invested_date: h.invested_date || null,
        notes: h.notes || null,
        meta_json: h.meta_json ? JSON.stringify(h.meta_json) : null,
        is_protection: h.is_protection ? 1 : 0,
        is_recurring: h.is_recurring ? 1 : 0,
        recurring_amount: h.recurring_amount ?? 0,
        recurring_frequency: h.recurring_frequency || null,
        cover_amount: h.cover_amount ?? 0,
        sort_order: index,
      });
    });
  });
  tx();
}

router.post("/register", (req, res) => {
  const { email, password, name, seedDemo } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const id = uuid();
  const password_hash = bcrypt.hashSync(password, 10);
  const share_token = uuid().replace(/-/g, "").slice(0, 16);

  db.prepare(
    `INSERT INTO users (id, email, name, password_hash, share_token, share_enabled)
     VALUES (?, ?, ?, ?, ?, 0)`
  ).run(id, email.toLowerCase(), name.trim(), password_hash, share_token);

  // Seed demo portfolio by default for first personal use
  if (seedDemo !== false) {
    seedHoldingsForUser(id);
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Login is temporarily unavailable. Please try again." });
  }
});

router.get("/me", authRequired, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

router.patch("/share", authRequired, (req, res) => {
  const { enabled, rotate } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let share_token = user.share_token;
  if (rotate || !share_token) {
    share_token = uuid().replace(/-/g, "").slice(0, 16);
  }

  const share_enabled =
    typeof enabled === "boolean" ? (enabled ? 1 : 0) : user.share_enabled;

  db.prepare(
    "UPDATE users SET share_token = ?, share_enabled = ? WHERE id = ?"
  ).run(share_token, share_enabled, user.id);

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
  res.json({ user: publicUser(updated) });
});

export default router;
