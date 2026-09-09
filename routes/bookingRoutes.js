const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireAdmin = require("../middlewares/requireAdmin");
const bookingController = require("../controllers/bookingController");
const uploadReceipt = require("../middlewares/uploadReceipt");

router.post("/book", verifyToken, bookingController.submitBooking);
router.get(
  "/bookings",
  verifyToken,
  requireAdmin,
  bookingController.getAllBookings,
);
router.get(
  "/bookings/refund-requests",
  verifyToken,
  requireAdmin,
  bookingController.getRefundRequests,
);
router.get(
  "/bookings/refund-requests/count",
  verifyToken,
  requireAdmin,
  bookingController.getRefundRequestCount,
);
router.get("/total_bookings", bookingController.getTotalBookings);
router.post(
  "/upload_receipt",
  verifyToken,
  uploadReceipt.single("receipt"),
  bookingController.uploadPaymentReceipt,
);
router.get("/bookings/:id", verifyToken, bookingController.getBookingById);
router.put(
  "/bookings/:id/status",
  verifyToken,
  requireAdmin,
  bookingController.updateBookingStatus,
);
router.get(
  "/bookings/user/:userId",
  verifyToken,
  bookingController.getUserBooking,
);
router.delete("/bookings/:id", verifyToken, bookingController.deleteBooking);
router.put(
  "/bookings/:id/cancel",
  verifyToken,
  bookingController.userCancelBooking,
);
router.put(
  "/bookings/:id/request-refund",
  verifyToken,
  bookingController.requestRefund,
);
router.put(
  "/bookings/:id/refund/approve",
  verifyToken,
  requireAdmin,
  bookingController.approveRefund,
);
router.put(
  "/bookings/:id/refund/deny",
  verifyToken,
  requireAdmin,
  bookingController.denyRefund,
);
router.post(
  "/paypal/create-order",
  verifyToken,
  bookingController.createPaypalOrder,
);
router.post(
  "/paypal/capture-order",
  verifyToken,
  bookingController.capturePaypalOrder,
);

module.exports = router;
