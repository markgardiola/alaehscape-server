const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireAdmin = require("../middlewares/requireAdmin");
const promoController = require("../controllers/promoController");

// Admin management
router.get(
  "/promo-codes",
  verifyToken,
  requireAdmin,
  promoController.getAllPromoCodes,
);
router.post(
  "/promo-codes",
  verifyToken,
  requireAdmin,
  promoController.createPromoCode,
);
router.put(
  "/promo-codes/:id",
  verifyToken,
  requireAdmin,
  promoController.updatePromoCode,
);
router.delete(
  "/promo-codes/:id",
  verifyToken,
  requireAdmin,
  promoController.deletePromoCode,
);

// Customer-facing: apply/remove on their own booking
router.post(
  "/bookings/:id/apply-promo",
  verifyToken,
  promoController.applyPromoToBooking,
);
router.delete(
  "/bookings/:id/promo",
  verifyToken,
  promoController.removePromoFromBooking,
);

module.exports = router;
