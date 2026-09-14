const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireAdmin = require("../middlewares/requireAdmin");
const reviewController = require("../controllers/reviewController");

router.post("/reviews", verifyToken, reviewController.createReview);
router.get("/resorts/:id/reviews", reviewController.getResortReviews);
router.get(
  "/reviews",
  verifyToken,
  requireAdmin,
  reviewController.getAllReviews,
);
router.delete(
  "/reviews/:id",
  verifyToken,
  requireAdmin,
  reviewController.deleteReview,
);

module.exports = router;
