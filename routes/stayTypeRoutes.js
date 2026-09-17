const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireAdmin = require("../middlewares/requireAdmin");
const stayTypeController = require("../controllers/stayTypeController");

router.get(
  "/resorts/:resortId/stay-types",
  stayTypeController.getStayTypesByResort,
);
router.post(
  "/resorts/:resortId/stay-types",
  verifyToken,
  requireAdmin,
  stayTypeController.createStayType,
);
router.put(
  "/stay-types/:id",
  verifyToken,
  requireAdmin,
  stayTypeController.updateStayType,
);
router.delete(
  "/stay-types/:id",
  verifyToken,
  requireAdmin,
  stayTypeController.deleteStayType,
);

module.exports = router;
