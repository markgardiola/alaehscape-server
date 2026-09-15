const db = require("../config/connectDB");

const VALID_DISCOUNT_TYPES = ["percent", "fixed"];

const normalizeCode = (code) => (code || "").trim().toUpperCase();

const validatePromoInput = ({ code, discountType, discountValue }) => {
  if (!code || !normalizeCode(code)) return "A promo code is required.";
  if (!VALID_DISCOUNT_TYPES.includes(discountType))
    return "Discount type must be 'percent' or 'fixed'.";
  const numericValue = Number(discountValue);
  if (!Number.isFinite(numericValue) || numericValue <= 0)
    return "Discount value must be a positive number.";
  if (discountType === "percent" && numericValue > 100)
    return "A percent discount can't exceed 100.";
  return null;
};

// ---------------------------------------------------------------------
// Admin CRUD
// ---------------------------------------------------------------------

// GET /api/promo-codes
exports.getAllPromoCodes = async (req, res) => {
  try {
    const promos = await db.query(
      `SELECT p.*,
              (SELECT COUNT(*)::int FROM bookings b
                WHERE b.promo_code = p.code AND b.status != 'Cancelled') AS used_count
       FROM promo_codes p
       ORDER BY p.created_at DESC`,
    );
    res.json(promos);
  } catch (err) {
    console.error("Error fetching promo codes:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching promo codes." });
  }
};

// POST /api/promo-codes
exports.createPromoCode = async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minBookingAmount,
    maxUses,
    expiresAt,
    active,
  } = req.body;

  const validationError = validatePromoInput({
    code,
    discountType,
    discountValue,
  });
  if (validationError)
    return res.status(400).json({ message: validationError });

  try {
    const result = await db.query(
      `INSERT INTO promo_codes
         (code, description, discount_type, discount_value, min_booking_amount, max_uses, expires_at, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        normalizeCode(code),
        description || null,
        discountType,
        discountValue,
        minBookingAmount || 0,
        maxUses || null,
        expiresAt || null,
        active !== false,
      ],
    );
    res.status(201).json(result[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "A promo code with that code already exists." });
    }
    console.error("Error creating promo code:", err);
    res
      .status(500)
      .json({ message: "Server error while creating promo code." });
  }
};

// PUT /api/promo-codes/:id
exports.updatePromoCode = async (req, res) => {
  const { id } = req.params;
  const {
    code,
    description,
    discountType,
    discountValue,
    minBookingAmount,
    maxUses,
    expiresAt,
    active,
  } = req.body;

  const validationError = validatePromoInput({
    code,
    discountType,
    discountValue,
  });
  if (validationError)
    return res.status(400).json({ message: validationError });

  try {
    const result = await db.query(
      `UPDATE promo_codes
          SET code = $1, description = $2, discount_type = $3, discount_value = $4,
              min_booking_amount = $5, max_uses = $6, expires_at = $7, active = $8
        WHERE id = $9
        RETURNING *`,
      [
        normalizeCode(code),
        description || null,
        discountType,
        discountValue,
        minBookingAmount || 0,
        maxUses || null,
        expiresAt || null,
        active !== false,
        id,
      ],
    );

    if (result.length === 0)
      return res.status(404).json({ message: "Promo code not found." });

    res.json(result[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "A promo code with that code already exists." });
    }
    console.error("Error updating promo code:", err);
    res
      .status(500)
      .json({ message: "Server error while updating promo code." });
  }
};

// DELETE /api/promo-codes/:id
// Existing bookings keep their promo_code text as a historical record --
// there's no foreign key here on purpose (see the migration file).
exports.deletePromoCode = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM promo_codes WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.length === 0)
      return res.status(404).json({ message: "Promo code not found." });

    res.json({ message: "Promo code deleted." });
  } catch (err) {
    console.error("Error deleting promo code:", err);
    res
      .status(500)
      .json({ message: "Server error while deleting promo code." });
  }
};

// ---------------------------------------------------------------------
// Customer-facing: apply/remove a promo code on their own Pending booking
// ---------------------------------------------------------------------

// POST /api/bookings/:id/apply-promo
exports.applyPromoToBooking = async (req, res) => {
  const { id } = req.params;
  const code = normalizeCode(req.body.code);

  if (!code)
    return res.status(400).json({ message: "Please enter a promo code." });

  try {
    const bookingRows = await db.query(
      "SELECT id, original_price, status FROM bookings WHERE id = $1 AND user_id = $2",
      [id, req.userId],
    );

    if (bookingRows.length === 0)
      return res.status(404).json({ message: "Booking not found." });

    const booking = bookingRows[0];

    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Promo codes can only be applied before payment.",
      });
    }

    const promoRows = await db.query(
      "SELECT * FROM promo_codes WHERE code = $1",
      [code],
    );

    if (promoRows.length === 0)
      return res
        .status(404)
        .json({ message: "That promo code doesn't exist." });

    const promo = promoRows[0];
    const originalPrice = Number(booking.original_price);

    if (!promo.active) {
      return res
        .status(400)
        .json({ message: "This promo code is no longer active." });
    }
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return res.status(400).json({ message: "This promo code has expired." });
    }
    if (originalPrice < Number(promo.min_booking_amount)) {
      return res.status(400).json({
        message: `This code requires a minimum booking amount of ₱${Number(
          promo.min_booking_amount,
        ).toLocaleString()}.`,
      });
    }
    if (promo.max_uses !== null) {
      const usageRows = await db.query(
        `SELECT COUNT(*)::int AS count FROM bookings
          WHERE promo_code = $1 AND status != 'Cancelled' AND id != $2`,
        [code, id],
      );
      if (usageRows[0].count >= promo.max_uses) {
        return res
          .status(400)
          .json({ message: "This promo code has reached its usage limit." });
      }
    }

    let discount =
      promo.discount_type === "percent"
        ? originalPrice * (Number(promo.discount_value) / 100)
        : Number(promo.discount_value);
    discount = Math.min(discount, originalPrice);
    discount = Math.round(discount * 100) / 100;
    const newTotal = Math.round((originalPrice - discount) * 100) / 100;

    await db.query(
      `UPDATE bookings SET promo_code = $1, discount_amount = $2, total_price = $3 WHERE id = $4`,
      [code, discount, newTotal, id],
    );

    res.json({
      message: "Promo code applied!",
      promoCode: code,
      discountAmount: discount,
      totalPrice: newTotal,
      originalPrice,
    });
  } catch (err) {
    console.error("Error applying promo code:", err);
    res
      .status(500)
      .json({ message: "Server error while applying promo code." });
  }
};

// DELETE /api/bookings/:id/promo
exports.removePromoFromBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE bookings
          SET promo_code = NULL, discount_amount = 0, total_price = original_price
        WHERE id = $1 AND user_id = $2 AND status = 'Pending'
        RETURNING total_price`,
      [id, req.userId],
    );

    if (result.length === 0)
      return res
        .status(404)
        .json({ message: "Booking not found or already paid." });

    res.json({
      message: "Promo code removed.",
      totalPrice: result[0].total_price,
    });
  } catch (err) {
    console.error("Error removing promo code:", err);
    res
      .status(500)
      .json({ message: "Server error while removing promo code." });
  }
};
