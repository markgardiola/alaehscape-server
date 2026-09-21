const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireOwner = require("../middlewares/requireOwner");
const ownerController = require("../controllers/ownerController");

router.get(
  "/owner/resorts",
  verifyToken,
  requireOwner,
  ownerController.getMyResorts,
);
router.get(
  "/owner/bookings",
  verifyToken,
  requireOwner,
  ownerController.getMyBookings,
);
router.get(
  "/owner/reviews",
  verifyToken,
  requireOwner,
  ownerController.getMyReviews,
);
router.get(
  "/owner/revenue",
  verifyToken,
  requireOwner,
  ownerController.getMyRevenue,
);

module.exports = router;
