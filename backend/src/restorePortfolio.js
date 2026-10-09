import { v4 as uuid } from "uuid";
import db from "./db.js";

/**
 * Upsert a user and replace their holdings from a backup payload.
 * Used by admin restore API and BOOTSTRAP_B64 on server start.
 */
export function restorePortfolio({ user, holdings }) {
  if (!user?.email || !user?.password_hash || !user?.name || !Array.isArray(holdings)) {
    throw new Error("Invalid restore payload");
  }

  const email = String(user.email).toLowerCase().trim();
  const name = String(user.name).trim();
  const passwordHash = String(user.password_hash);
  const shareToken =
    (user.share_token && String(user.share_token)) ||
    uuid().replace(/-/g, "").slice(0, 16);
  const shareEnabled = user.share_enabled ? 1 : 0;

  const tx = db.transaction(() => {
    let existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    let userId = existing?.id;

    if (userId) {
      db.prepare(
        `UPDATE users
         SET name = ?, password_hash = ?, share_token = ?, share_enabled = ?
         WHERE id = ?`
      ).run(name, passwordHash, shareToken, shareEnabled, userId);
      db.prepare("DELETE FROM holdings WHERE user_id = ?").run(userId);
    } else {
      userId = user.id || uuid();
      db.prepare(
        `INSERT INTO users (id, email, name, password_hash, share_token, share_enabled)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(userId, email, name, passwordHash, shareToken, shareEnabled);
    }

    const insert = db.prepare(`
      INSERT INTO holdings (
        id, user_id, category_id, name, platform,
        invested_amount, current_value, invested_date, notes, meta_json,
        is_protection, is_recurring, recurring_amount, recurring_frequency,
        cover_amount, sort_order, created_at, updated_at
      ) VALUES (
        @id, @user_id, @category_id, @name, @platform,
        @invested_amount, @current_value, @invested_date, @notes, @meta_json,
        @is_protection, @is_recurring, @recurring_amount, @recurring_frequency,
        @cover_amount, @sort_order, @created_at, @updated_at
      )
    `);

    for (const [index, h] of holdings.entries()) {
      insert.run({
        id: h.id || uuid(),
        user_id: userId,
        category_id: h.category_id,
        name: h.name,
        platform: h.platform || null,
        invested_amount: Number(h.invested_amount) || 0,
        current_value: Number(h.current_value) || 0,
        invested_date: h.invested_date || null,
        notes: h.notes || null,
        meta_json: h.meta_json || null,
        is_protection: h.is_protection ? 1 : 0,
        is_recurring: h.is_recurring ? 1 : 0,
        recurring_amount: Number(h.recurring_amount) || 0,
        recurring_frequency: h.recurring_frequency || null,
        cover_amount: Number(h.cover_amount) || 0,
        sort_order: h.sort_order ?? index,
        created_at: h.created_at || new Date().toISOString(),
        updated_at: h.updated_at || new Date().toISOString(),
      });
    }

    return { userId, count: holdings.length, shareToken, shareEnabled, email };
  });

  return tx();
}

/** Apply BOOTSTRAP_B64 on every boot so free-tier ephemeral disks refill */
export function bootstrapFromEnv() {
  const b64 = process.env.BOOTSTRAP_B64;
  if (!b64) return null;

  try {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const payload = JSON.parse(json);
    const result = restorePortfolio(payload);
    console.log(
      `Bootstrap restored ${result.count} holdings for ${result.email}`
    );
    return result;
  } catch (err) {
    console.error("Bootstrap restore failed:", err);
    return null;
  }
}
