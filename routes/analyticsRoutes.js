const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireAdmin = require("../middlewares/requireAdmin");
const analyticsController = require("../controllers/analyticsController");

router.get(
  "/admin/analytics",
  verifyToken,
  requireAdmin,
  analyticsController.getDashboardAnalytics,
);
router.get(
  "/admin/settings/commission-rate",
  verifyToken,
  requireAdmin,
  analyticsController.getCommissionRate,
);
router.put(
  "/admin/settings/commission-rate",
  verifyToken,
  requireAdmin,
  analyticsController.updateCommissionRate,
);

module.exports = router;
