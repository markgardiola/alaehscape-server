const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const notificationController = require("../controllers/notificationController");

router.get(
  "/notifications",
  verifyToken,
  notificationController.getMyNotifications,
);
router.put(
  "/notifications/:id/read",
  verifyToken,
  notificationController.markAsRead,
);
router.put(
  "/notifications/read-all",
  verifyToken,
  notificationController.markAllAsRead,
);
router.put(
  "/notifications/:id/hide",
  verifyToken,
  notificationController.hideNotification,
);

module.exports = router;
