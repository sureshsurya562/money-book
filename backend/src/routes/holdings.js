import { Router } from "express";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { authRequired } from "../middleware.js";
import {
  CATEGORIES,
  PILLARS,
  enrichCategory,
  getCategory,
  getPillar,
} from "../categories.js";

const router = Router();

function mapHolding(row) {
  const invested = Number(row.invested_amount) || 0;
  const current = Number(row.current_value) || 0;
  const profit = current - invested;
  const profitPct = invested > 0 ? (profit / invested) * 100 : 0;
  const category = enrichCategory(getCategory(row.category_id));
  const pillar = category ? getPillar(category.pillarId) : null;

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: category?.name || row.category_id,
    categoryColor: category?.color || "#64748B",
    categoryIcon: category?.icon || "circle",
    pillarId: category?.pillarId || null,
    pillarName: pillar?.name || null,
    pillarColor: pillar?.color || "#64748B",
    name: row.name,
    platform: row.platform,
    investedAmount: invested,
    currentValue: current,
    profit,
    profitPct,
    investedDate: row.invested_date,
    notes: row.notes,
    meta: row.meta_json ? JSON.parse(row.meta_json) : null,
    isProtection: !!row.is_protection,
    isRecurring: !!row.is_recurring,
    recurringAmount: Number(row.recurring_amount) || 0,
    recurringFrequency: row.recurring_frequency,
    coverAmount: Number(row.cover_amount) || 0,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function summarize(holdings) {
  // Money you already have (emergency + long-term growth) — not insurance / not "future cover"
  const wealthHoldings = holdings.filter(
    (h) =>
      !h.isProtection &&
      (h.pillarId === "emergency" || h.pillarId === "growth")
  );
  const invested = wealthHoldings.reduce((s, h) => s + h.investedAmount, 0);
  const current = wealthHoldings.reduce((s, h) => s + h.currentValue, 0);
  const profit = current - invested;
  const profitPct = invested > 0 ? (profit / invested) * 100 : 0;

  const byCategory = {};
  for (const h of holdings) {
    if (!byCategory[h.categoryId]) {
      byCategory[h.categoryId] = {
        categoryId: h.categoryId,
        name: h.categoryName,
        color: h.categoryColor,
        icon: h.categoryIcon,
        pillarId: h.pillarId,
        invested: 0,
        current: 0,
        count: 0,
        cover: 0,
        monthlyRecurring: 0,
        yearlyRecurring: 0,
      };
    }
    byCategory[h.categoryId].count += 1;
    if (h.isProtection || h.categoryId === "term_insurance" || h.categoryId === "health_insurance") {
      byCategory[h.categoryId].cover += h.coverAmount;
    } else {
      byCategory[h.categoryId].invested += h.investedAmount;
      byCategory[h.categoryId].current += h.currentValue;
    }
    if (h.isRecurring && h.recurringFrequency === "monthly") {
      byCategory[h.categoryId].monthlyRecurring += h.recurringAmount;
    }
    if (h.isRecurring && h.recurringFrequency === "yearly") {
      byCategory[h.categoryId].yearlyRecurring += h.recurringAmount;
    }
  }

  const byPillar = PILLARS.map((pillar) => {
    const cats = CATEGORIES.filter((c) => c.pillarId === pillar.id);
    const pillarHoldings = holdings.filter((h) => h.pillarId === pillar.id);
    const assetHoldings = pillarHoldings.filter((h) => !h.isProtection);
    const pInvested = assetHoldings.reduce((s, h) => s + h.investedAmount, 0);
    const pCurrent = assetHoldings.reduce((s, h) => s + h.currentValue, 0);
    const pCover = pillarHoldings.reduce((s, h) => s + (h.coverAmount || 0), 0);
    const subcategories = cats.map((cat) => {
      const bucket = byCategory[cat.id] || {
        categoryId: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        pillarId: pillar.id,
        invested: 0,
        current: 0,
        count: 0,
        cover: 0,
        monthlyRecurring: 0,
        yearlyRecurring: 0,
      };
      return {
        ...bucket,
        shortName: cat.shortName,
        description: cat.description,
        whyUseful: cat.whyUseful,
        benefits: cat.benefits,
      };
    });

    const wealthBase = current > 0 ? current : 1;
    const isWealthPillar = pillar.id === "emergency" || pillar.id === "growth";

    return {
      id: pillar.id,
      name: pillar.name,
      shortName: pillar.shortName,
      color: pillar.color,
      accent: pillar.accent,
      icon: pillar.icon,
      tagline: pillar.tagline,
      description: pillar.description,
      whyUseful: pillar.whyUseful,
      benefits: pillar.benefits,
      howItWorks: pillar.howItWorks,
      invested: pInvested,
      current: pCurrent,
      profit: pCurrent - pInvested,
      cover: pCover,
      count: pillarHoldings.length,
      allocationPct: isWealthPillar ? (pCurrent / wealthBase) * 100 : 0,
      kind: pillar.id === "insurance" || pillar.id === "retirement" ? "future" : "wealth",
      subcategories,
    };
  });

  const monthlyOutflow = holdings
    .filter((h) => h.isRecurring && h.recurringFrequency === "monthly")
    .reduce((s, h) => s + h.recurringAmount, 0);

  const yearlyInsurance = holdings
    .filter(
      (h) =>
        (h.isProtection || h.pillarId === "insurance") &&
        h.recurringFrequency === "yearly"
    )
    .reduce((s, h) => s + h.recurringAmount, 0);

  const termItems = holdings.filter(
    (h) => h.categoryId === "term_insurance" || (h.isProtection && /term/i.test(h.name))
  );
  const healthItems = holdings.filter(
    (h) => h.categoryId === "health_insurance" || (h.isProtection && /health/i.test(h.name))
  );
  const pensionItems = holdings.filter((h) => h.pillarId === "retirement");

  const termCover = termItems.reduce((s, h) => s + h.coverAmount, 0);
  const healthCover = healthItems.reduce((s, h) => s + h.coverAmount, 0);
  const totalCover = holdings
    .filter((h) => h.isProtection || h.pillarId === "insurance")
    .reduce((s, h) => s + h.coverAmount, 0);

  const retirementCorpus = pensionItems.reduce((s, h) => s + h.currentValue, 0);
  const monthlyPension = pensionItems
    .filter((h) => h.isRecurring && h.recurringFrequency === "monthly")
    .reduce((s, h) => s + h.recurringAmount, 0);

  const futureItems = [...termItems, ...healthItems, ...pensionItems].map((h) => ({
    id: h.id,
    name: h.name,
    categoryId: h.categoryId,
    categoryName: h.categoryName,
    pillarId: h.pillarId,
    coverAmount: h.coverAmount,
    currentValue: h.currentValue,
    investedAmount: h.investedAmount,
    recurringAmount: h.recurringAmount,
    recurringFrequency: h.recurringFrequency,
    isProtection: h.isProtection,
    notes: h.notes,
    platform: h.platform,
  }));

  return {
    totalInvested: invested,
    totalCurrent: current,
    totalProfit: profit,
    totalProfitPct: profitPct,
    holdingCount: holdings.length,
    assetCount: wealthHoldings.length,
    byCategory: Object.values(byCategory).sort((a, b) => b.current - a.current),
    byPillar,
    wealthPillars: byPillar.filter((p) => p.kind === "wealth"),
    futurePillars: byPillar.filter((p) => p.kind === "future"),
    monthlyOutflow,
    yearlyInsurancePremium: yearlyInsurance,
    totalInsuranceCover: totalCover,
    future: {
      termCover,
      healthCover,
      totalCover,
      yearlyPremium: yearlyInsurance,
      monthlyPension,
      monthlyCommitments: monthlyOutflow,
      retirementCorpus,
      items: futureItems,
    },
  };
}

router.get("/categories", (_req, res) => {
  res.json({
    categories: CATEGORIES.map(enrichCategory),
    pillars: PILLARS,
  });
});

router.get("/categories/:id", (req, res) => {
  const category = enrichCategory(getCategory(req.params.id));
  if (!category) return res.status(404).json({ error: "Category not found" });
  const pillar = getPillar(category.pillarId);
  res.json({ category, pillar });
});

router.get("/pillars", (_req, res) => {
  res.json({ pillars: PILLARS });
});

router.get("/", authRequired, (req, res) => {
  const rows = db
    .prepare(
      "SELECT * FROM holdings WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC"
    )
    .all(req.user.id);
  const holdings = rows.map(mapHolding);
  res.json({
    holdings,
    summary: summarize(holdings),
    categories: CATEGORIES.map(enrichCategory),
    pillars: PILLARS,
  });
});

router.get("/:id", authRequired, (req, res) => {
  const row = db
    .prepare("SELECT * FROM holdings WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: "Holding not found" });
  const holding = mapHolding(row);
  const category = enrichCategory(getCategory(holding.categoryId));
  const pillar = category ? getPillar(category.pillarId) : null;
  res.json({ holding, category, pillar });
});

router.post("/", authRequired, (req, res) => {
  const {
    categoryId,
    name,
    platform,
    investedAmount,
    currentValue,
    investedDate,
    notes,
    isProtection,
    isRecurring,
    recurringAmount,
    recurringFrequency,
    coverAmount,
  } = req.body || {};

  if (!categoryId || !name) {
    return res.status(400).json({ error: "categoryId and name are required" });
  }
  if (!getCategory(categoryId)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const id = uuid();
  const invested = Number(investedAmount) || 0;
  const current =
    currentValue === undefined || currentValue === null || currentValue === ""
      ? invested
      : Number(currentValue) || 0;

  const cat = getCategory(categoryId);
  const autoProtection =
    isProtection !== undefined
      ? !!isProtection
      : cat?.pillarId === "insurance";

  db.prepare(
    `INSERT INTO holdings (
      id, user_id, category_id, name, platform,
      invested_amount, current_value, invested_date, notes,
      is_protection, is_recurring, recurring_amount, recurring_frequency, cover_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user.id,
    categoryId,
    name.trim(),
    platform || null,
    invested,
    current,
    investedDate || null,
    notes || null,
    autoProtection ? 1 : 0,
    isRecurring ? 1 : 0,
    Number(recurringAmount) || 0,
    recurringFrequency || null,
    Number(coverAmount) || 0
  );

  const row = db.prepare("SELECT * FROM holdings WHERE id = ?").get(id);
  res.status(201).json({ holding: mapHolding(row) });
});

router.put("/:id", authRequired, (req, res) => {
  const existing = db
    .prepare("SELECT * FROM holdings WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: "Holding not found" });

  const {
    categoryId,
    name,
    platform,
    investedAmount,
    currentValue,
    investedDate,
    notes,
    isProtection,
    isRecurring,
    recurringAmount,
    recurringFrequency,
    coverAmount,
  } = req.body || {};

  const nextCategory = categoryId || existing.category_id;
  if (!getCategory(nextCategory)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  db.prepare(
    `UPDATE holdings SET
      category_id = ?,
      name = ?,
      platform = ?,
      invested_amount = ?,
      current_value = ?,
      invested_date = ?,
      notes = ?,
      is_protection = ?,
      is_recurring = ?,
      recurring_amount = ?,
      recurring_frequency = ?,
      cover_amount = ?,
      updated_at = datetime('now')
    WHERE id = ? AND user_id = ?`
  ).run(
    nextCategory,
    name !== undefined ? name.trim() : existing.name,
    platform !== undefined ? platform : existing.platform,
    investedAmount !== undefined ? Number(investedAmount) || 0 : existing.invested_amount,
    currentValue !== undefined ? Number(currentValue) || 0 : existing.current_value,
    investedDate !== undefined ? investedDate : existing.invested_date,
    notes !== undefined ? notes : existing.notes,
    isProtection !== undefined ? (isProtection ? 1 : 0) : existing.is_protection,
    isRecurring !== undefined ? (isRecurring ? 1 : 0) : existing.is_recurring,
    recurringAmount !== undefined
      ? Number(recurringAmount) || 0
      : existing.recurring_amount,
    recurringFrequency !== undefined
      ? recurringFrequency
      : existing.recurring_frequency,
    coverAmount !== undefined ? Number(coverAmount) || 0 : existing.cover_amount,
    req.params.id,
    req.user.id
  );

  const row = db.prepare("SELECT * FROM holdings WHERE id = ?").get(req.params.id);
  res.json({ holding: mapHolding(row) });
});

router.delete("/:id", authRequired, (req, res) => {
  const result = db
    .prepare("DELETE FROM holdings WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Holding not found" });
  }
  res.json({ ok: true });
});

export default router;
export { mapHolding, summarize };
