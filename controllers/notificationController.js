const db = require("../config/connectDB");

exports.getMyNotifications = async (req, res) => {
  try {
    const rows =
      req.userRole === "admin"
        ? await db.query(
            `SELECT * FROM notifications
              WHERE recipient_role = 'admin' AND is_hidden = false
              ORDER BY created_at DESC
              LIMIT 50`,
          )
        : await db.query(
            `SELECT * FROM notifications
              WHERE user_id = $1 AND is_hidden = false
              ORDER BY created_at DESC
              LIMIT 50`,
            [req.userId],
          );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.userRole === "admin") {
      await db.query(
        `UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_role = 'admin'`,
        [id],
      );
    } else {
      await db.query(
        `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
        [id, req.userId],
      );
    }
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("Error marking notification read:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    if (req.userRole === "admin") {
      await db.query(
        `UPDATE notifications SET is_read = true WHERE recipient_role = 'admin' AND is_read = false`,
      );
    } else {
      await db.query(
        `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
        [req.userId],
      );
    }
    res.json({ message: "All marked as read" });
  } catch (err) {
    console.error("Error marking all notifications read:", err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

exports.hideNotification = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.userRole === "admin") {
      await db.query(
        `UPDATE notifications SET is_hidden = true WHERE id = $1 AND recipient_role = 'admin'`,
        [id],
      );
    } else {
      await db.query(
        `UPDATE notifications SET is_hidden = true WHERE id = $1 AND user_id = $2`,
        [id, req.userId],
      );
    }
    res.json({ message: "Notification removed" });
  } catch (err) {
    console.error("Error hiding notification:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
};
