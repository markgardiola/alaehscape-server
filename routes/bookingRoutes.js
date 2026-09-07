const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const bookingController = require("../controllers/bookingController");
const uploadReceipt = require("../middlewares/uploadReceipt");

router.post("/book", verifyToken, bookingController.submitBooking);
router.get("/bookings", verifyToken, bookingController.getAllBookings);
router.get("/total_bookings", bookingController.getTotalBookings);
router.post(
  "/upload_receipt",
  uploadReceipt.single("receipt"),
  bookingController.uploadPaymentReceipt,
);
router.get("/bookings/:id", verifyToken, bookingController.getBookingById);
router.put(
  "/bookings/:id/status",
  verifyToken,
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
  bookingController.approveRefund,
);
router.put(
  "/bookings/:id/refund/deny",
  verifyToken,
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
