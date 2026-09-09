const db = require("../config/connectDB");
const bcrypt = require("bcrypt");
const { notifyUser } = require("../utils/notify");

exports.getTotalUsers = async (req, res) => {
  try {
    const results = await db.query(
      'SELECT COUNT(*) AS "totalUsers" FROM users',
    );
    res.json({ totalUsers: Number(results[0].totalUsers) });
  } catch (err) {
    console.error("Error fetching total users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT username, email, phone, address FROM users WHERE id = $1",
      [req.userId],
    );
    if (result.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ user: result[0] });
  } catch (err) {
    console.error("Get user info error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

exports.updateUser = async (req, res) => {
  const { username, email, password, phone, address } = req.body;

  try {
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const sql = hashedPassword
      ? "UPDATE users SET username=$1, email=$2, password=$3, phone=$4, address=$5 WHERE id=$6"
      : "UPDATE users SET username=$1, email=$2, phone=$3, address=$4 WHERE id=$5";

    const params = hashedPassword
      ? [username, email, hashedPassword, phone, address, req.userId]
      : [username, email, phone, address, req.userId];

    await db.query(sql, params);

    notifyUser(req.userId, {
      type: "profile_update",
      title: "Profile updated",
      message: "Your personal information was updated successfully.",
      link: "/profile",
    });

    res.json({ success: "Profile updated" });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const results = await db.query(
      "SELECT id, username, email, phone, address FROM users",
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.adminUpdateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, phone, address, password } = req.body;

  try {
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const sql = passwordHash
      ? `UPDATE users SET username = $1, email = $2, phone = $3, address = $4, password = $5 WHERE id = $6`
      : `UPDATE users SET username = $1, email = $2, phone = $3, address = $4 WHERE id = $5`;

    const params = passwordHash
      ? [username, email, phone, address, passwordHash, userId]
      : [username, email, phone, address, userId];

    await db.query(sql, params);
    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [userId],
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
