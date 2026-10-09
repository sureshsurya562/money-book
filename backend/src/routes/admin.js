import { Router } from "express";
import { restorePortfolio } from "../restorePortfolio.js";

const router = Router();

function authorized(req) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;
  return req.headers["x-sync-secret"] === secret;
}

/** Restore a local account + holdings into production */
router.post("/restore-user", (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = restorePortfolio({
      user: req.body?.user,
      holdings: req.body?.holdings,
    });
    res.json({
      ok: true,
      email: result.email,
      userId: result.userId,
      holdingsRestored: result.count,
      shareEnabled: !!result.shareEnabled,
      shareToken: result.shareToken,
      shareUrl: result.shareEnabled ? `/p/${result.shareToken}` : null,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: err.message || "Restore failed",
    });
  }
});

export default router;
