const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const bookingController = require("../controllers/bookingController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/receipts/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;

router.post("/book", verifyToken, bookingController.submitBooking);
router.get("/bookings", verifyToken, bookingController.getAllBookings);
router.get('/total_bookings', bookingController.getTotalBookings);
router.post("/upload_receipt", upload.single("receipt"), bookingController.uploadPaymentReceipt);
router.get("/bookings/:id", verifyToken, bookingController.getBookingById);
router.put("/bookings/:id/status", verifyToken, bookingController.updateBookingStatus);
router.get("/bookings/user/:userId", verifyToken, bookingController.getUserBooking);
router.delete('/bookings/:id', verifyToken, bookingController.deleteBooking);
router.put('/bookings/:id/cancel', verifyToken, bookingController.userCancelBooking);




module.exports = router;
