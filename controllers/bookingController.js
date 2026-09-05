const db = require("../config/connectDB");
const sendEmail = require("../utils/sendEmail");
const tplApproved = require("../templates/bookingApproved");
const tplCancelled = require("../templates/bookingCancelled");

exports.getTotalBookings = async (req, res) => {
  try {
    const results = await db.query(
      "SELECT COUNT(*) AS \"totalBookings\" FROM bookings WHERE status = 'Confirmed'",
    );
    res.json({ totalBookings: Number(results[0].totalBookings) });
  } catch (err) {
    console.error("Error fetching total bookings:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.submitBooking = async (req, res) => {
  const {
    resortId,
    fullName,
    email,
    mobile,
    address,
    checkIn,
    checkOut,
    adults,
    children,
  } = req.body;

  const userId = req.userId;

  const sql = `
    INSERT INTO bookings
    (user_id, resort_id, full_name, email, mobile, address, check_in, check_out, adults, children)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `;

  const values = [
    userId,
    resortId,
    fullName,
    email,
    mobile,
    address,
    checkIn,
    checkOut,
    adults,
    children,
  ];

  try {
    const result = await db.query(sql, values);

    res.status(201).json({
      message: "Booking submitted successfully",
      bookingId: result[0].id,
    });
  } catch (err) {
    console.error("Booking insert error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.getAllBookings = async (req, res) => {
  const sql = `
    SELECT
      bookings.id AS booking_id,
      users.username,
      resorts.name AS resort_name,
      bookings.check_in,
      bookings.check_out,
      bookings.status
    FROM bookings
    JOIN users ON bookings.user_id = users.id
    JOIN resorts ON bookings.resort_id = resorts.id
    ORDER BY bookings.created_at DESC
  `;

  try {
    const results = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.uploadPaymentReceipt = async (req, res) => {
  const { bookingId } = req.body;
  const receiptImage = req.file.path;

  if (!bookingId || !receiptImage) {
    return res
      .status(400)
      .json({ message: "Missing bookingId or receipt file." });
  }

  try {
    await db.query("UPDATE bookings SET receipt = $1 WHERE id = $2", [
      receiptImage,
      bookingId,
    ]);
    return res.status(200).json({ message: "Receipt uploaded successfully!" });
  } catch (err) {
    console.error("Receipt upload error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

exports.getBookingById = async (req, res) => {
  const bookingId = req.params.id;

  const sql = `
    SELECT
      b.*,
      r.name AS resort_name
    FROM bookings b
    JOIN resorts r ON b.resort_id = r.id
    WHERE b.id = $1
  `;

  try {
    const results = await db.query(sql, [bookingId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["Confirmed", "Cancelled", "Pending"];
  if (!allowed.includes(status))
    return res.status(400).json({ error: "Invalid status" });

  try {
    const result = await db.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id",
      [status, id],
    );
    if (result.length === 0)
      return res.status(404).json({ error: "Booking not found" });

    const rows = await db.query(
      `SELECT b.id,
              TO_CHAR(b.check_in,  'FMMonth FMDD, YYYY') AS "checkIn",
              TO_CHAR(b.check_out, 'FMMonth FMDD, YYYY') AS "checkOut",
              b.adults,
              b.children,
              b.full_name,
              ud.email,
              ud.username,
              r.name AS resort
         FROM bookings b
         JOIN users ud ON ud.id = b.user_id
         JOIN resorts r ON r.id = b.resort_id
        WHERE b.id = $1`,
      [id],
    );

    const booking = rows[0];

    let subject, html;
    if (status === "Confirmed") {
      subject = "Your booking is confirmed! 🎉";
      html = tplApproved({
        full_name: booking.full_name,
        resort: booking.resort,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        adults: booking.adults,
        children: booking.children,
      });
    } else if (status === "Cancelled") {
      subject = "Your booking has been cancelled";
      html = tplCancelled({
        full_name: booking.full_name,
        resort: booking.resort,
      });
    }

    if (html) {
      sendEmail(booking.email, subject, html)
        .then(() => console.log(`✅ ${status} email sent to ${booking.email}`))
        .catch((err) => console.error("❌ Email error:", err));
    }

    res.json({ message: `Booking ${status}` });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ error: "Failed to update booking status" });
  }
};

exports.getUserBooking = async (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT
      b.id,
      r.name AS resort_name,
      b.check_in,
      b.check_out,
      b.adults,
      b.children,
      b.status,
      b.created_at
    FROM bookings b
    JOIN resorts r ON b.resort_id = r.id
    WHERE b.user_id = $1
    ORDER BY b.created_at DESC
  `;

  try {
    const results = await db.query(query, [userId]);
    res.json(results);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM bookings WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.length === 0)
      return res.status(404).json({ error: "Booking not found" });

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

exports.userCancelBooking = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "Cancelled") {
    return res.status(400).json({ error: "Users can only cancel bookings" });
  }

  try {
    const result = await db.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id",
      [status, id],
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Booking not found or already cancelled" });
    }

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};
