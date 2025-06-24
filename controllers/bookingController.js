const db = require("../config/connectDB");
const sendEmail = require('../utils/sendEmail')
const tplApproved = require('../templates/bookingApproved');
const tplCancelled = require('../templates/bookingCancelled');

exports.getTotalBookings = (req, res) => {
  const query = 'SELECT COUNT(*) AS totalBookings FROM bookings WHERE status = "Confirmed"';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total resorts:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ totalBookings: results[0].totalBookings });
  });
};

exports.submitBooking = (req, res) => {
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Booking insert error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({
      message: "Booking submitted successfully",
      bookingId: result.insertId
    });
  });
};

exports.getAllBookings = (req, res) => {
  const sql = `
    SELECT 
      bookings.id AS booking_id,
      user_details.username,
      resorts.name AS resort_name,
      bookings.check_in,
      bookings.check_out,
      bookings.status
    FROM bookings
    JOIN user_details ON bookings.user_id = user_details.id
    JOIN resorts ON bookings.resort_id = resorts.id
    ORDER BY bookings.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
};

exports.uploadPaymentReceipt = (req, res) => {
  const { bookingId } = req.body;
  const receiptImage = req.file.path;

  if (!bookingId || !receiptImage) {
    return res.status(400).json({ message: "Missing bookingId or receipt file." });
  }

  const sql = "UPDATE bookings SET receipt = ? WHERE id = ?";

  db.query(sql, [receiptImage, bookingId], (err, result) => {
    if (err) {
      console.error("Receipt upload error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({ message: "Receipt uploaded successfully!" });
  });
};

exports.getBookingById = (req, res) => {
  const bookingId = req.params.id;

  const sql = `
    SELECT 
      b.*, 
      r.name AS resort_name 
    FROM bookings b
    JOIN resorts r ON b.resort_id = r.id
    WHERE b.id = ?
  `;

  db.query(sql, [bookingId], (err, results) => {
    if (err) {
      console.error("Error fetching booking:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(results[0]);
  });
};

exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['Confirmed', 'Cancelled', 'Pending'];
  if (!allowed.includes(status))
    return res.status(400).json({ error: 'Invalid status' });

  try {
    const result = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Booking not found' });

    const rows = await db.query(
      `SELECT b.id,
              DATE_FORMAT(b.check_in , '%M %e, %Y') AS checkIn,
              DATE_FORMAT(b.check_out, '%M %e, %Y') AS checkOut,
              b.adults,                    -- Separate count for adults
              b.children,                  -- Separate count for children
              b.full_name,
              ud.email,
              ud.username,
              r.name AS resort
         FROM bookings b
         JOIN user_details ud ON ud.id = b.user_id
         JOIN resorts r        ON r.id = b.resort_id
        WHERE b.id = ?`,
      [id]
    );

    const booking = rows[0];

    let subject, html;
    if (status === 'Confirmed') {
      subject = 'Your booking is confirmed! 🎉';
      html = tplApproved({
        full_name: booking.full_name,
        resort: booking.resort,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        adults: booking.adults,
        children: booking.children,
      });
    } else if (status === 'Cancelled') {
      subject = 'Your booking has been cancelled';
      html = tplCancelled({
        full_name: booking.full_name,
        resort: booking.resort,
      });
    }

    if (html) {
      sendEmail(booking.email, subject, html)
        .then(() =>
          console.log(`✅ ${status} email sent to ${booking.email}`)
        )
        .catch(err => console.error('❌ Email error:', err));
    }

    res.json({ message: `Booking ${status}` });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

exports.getUserBooking = (req, res) => {
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
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
};

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Booking not found' });

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};

exports.userCancelBooking = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'Cancelled') {
    return res.status(400).json({ error: 'Users can only cancel bookings' });
  }

  try {
    const result = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found or already cancelled' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};
