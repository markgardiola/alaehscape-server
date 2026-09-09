const express = require("express");
const router = express.Router();
const resortController = require("../controllers/resortController");
const uploadResortImages = require("../middlewares/uploadResortImage");
const verifyToken = require("../middlewares/verifyToken");
const requireAdmin = require("../middlewares/requireAdmin");

router.post(
  "/add_resort",
  verifyToken,
  requireAdmin,
  uploadResortImages.array("images", 10),
  resortController.createResort,
);
router.get("/resorts", resortController.getAllResorts);
router.get("/total_resorts", resortController.getTotalResorts);
router.get("/resorts/:id", resortController.getResortById);
router.delete(
  "/resorts/:id",
  verifyToken,
  requireAdmin,
  resortController.deleteResort,
);
router.put(
  "/resorts/:id",
  verifyToken,
  requireAdmin,
  uploadResortImages.array("images", 10),
  resortController.updateResort,
);
router.get("/resorts/location/:location", resortController.getResortByLocation);

module.exports = router;
