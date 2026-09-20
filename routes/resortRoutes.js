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
  uploadResortImages.any(),
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
  uploadResortImages.any(),
  resortController.updateResort,
);
router.get(
  "/resorts/barangay/:barangay",
  resortController.getResortsByBarangay,
);

module.exports = router;
