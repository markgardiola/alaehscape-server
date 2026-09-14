const db = require("../config/connectDB");

// POST /api/reviews
// A customer leaves a review for a stay they actually completed.
// Eligibility is enforced here, not just hidden in the UI: the booking
// must belong to the requesting user, be Confirmed, and its check-out
// date must already have passed.
exports.createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const numericRating = Number(rating);
  if (
    !bookingId ||
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res
      .status(400)
      .json({ message: "A booking and a rating from 1 to 5 are required." });
  }

  try {
    const bookingResults = await db.query(
      `SELECT id, resort_id FROM bookings
       WHERE id = $1 AND user_id = $2 AND status = 'Confirmed' AND check_out < CURRENT_DATE`,
      [bookingId, req.userId],
    );

    if (bookingResults.length === 0) {
      return res.status(403).json({
        message:
          "This booking isn't eligible for a review yet (it must be a completed, confirmed stay).",
      });
    }

    const { resort_id: resortId } = bookingResults[0];

    const result = await db.query(
      `INSERT INTO reviews (booking_id, resort_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, rating, comment, created_at`,
      [bookingId, resortId, req.userId, numericRating, comment || null],
    );

    res
      .status(201)
      .json({ message: "Review submitted. Thank you!", review: result[0] });
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation on reviews.booking_id
      return res
        .status(409)
        .json({ message: "You've already reviewed this booking." });
    }
    console.error("Error creating review:", err);
    res.status(500).json({ message: "Server error while submitting review." });
  }
};

// GET /api/resorts/:id/reviews
// Public: powers the "Reviews" section on the resort detail page.
exports.getResortReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const reviews = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.resort_id = $1
       ORDER BY r.created_at DESC`,
      [id],
    );

    const summaryResults = await db.query(
      `SELECT COUNT(*)::int AS count, COALESCE(AVG(rating)::float, 0) AS average
       FROM reviews WHERE resort_id = $1`,
      [id],
    );

    res.json({
      average: summaryResults[0].average,
      count: summaryResults[0].count,
      reviews,
    });
  } catch (err) {
    console.error("Error fetching resort reviews:", err);
    res.status(500).json({ message: "Server error while fetching reviews." });
  }
};

// GET /api/reviews
// Admin: every review across every resort, for the moderation feed.
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.username, res.id AS resort_id, res.name AS resort_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN resorts res ON r.resort_id = res.id
       ORDER BY r.created_at DESC`,
    );
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching all reviews:", err);
    res.status(500).json({ message: "Server error while fetching reviews." });
  }
};

// DELETE /api/reviews/:id
// Admin moderation -- e.g. removing spam or abusive comments.
exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM reviews WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.json({ message: "Review deleted." });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ message: "Server error while deleting review." });
  }
};
