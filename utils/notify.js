const db = require("../config/connectDB");

/**
 * Fire-and-forget notification creation, used from other controllers at
 * the moment something notification-worthy happens (registration, a
 * booking's status changing, a refund decision, etc). Never throws --
 * a notification failing to write should never break the action that
 * triggered it, same philosophy as the best-effort email sends.
 */
const notifyUser = async (userId, { type, title, message, link }) => {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, recipient_role, type, title, message, link)
       VALUES ($1, 'user', $2, $3, $4, $5)`,
      [userId, type, title, message || null, link || null],
    );
  } catch (err) {
    console.error("Failed to create user notification:", err);
  }
};

const notifyAdmin = async ({ type, title, message, link }) => {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, recipient_role, type, title, message, link)
       VALUES (NULL, 'admin', $1, $2, $3, $4)`,
      [type, title, message || null, link || null],
    );
  } catch (err) {
    console.error("Failed to create admin notification:", err);
  }
};

module.exports = { notifyUser, notifyAdmin };
