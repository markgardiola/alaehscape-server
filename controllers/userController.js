const db = require('../config/connectDB');
const bcrypt = require('bcrypt');

exports.getTotalUsers = (req, res) => {
  const query = 'SELECT COUNT(*) AS totalUsers FROM user_details';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total users:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ totalUsers: results[0].totalUsers });
  });
};

exports.getUserInfo = (req, res) => {
  const sql = "SELECT username, email, phone, address FROM user_details WHERE id = ?";
  db.query(sql, [req.userId], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (result.length === 0) return res.status(404).json({ message: "User not found" });
    res.json({ user: result[0] });
  });
};

exports.updateUser = (req, res) => {
  const { username, email, password, phone, address } = req.body;

  const update = (hashedPassword = null) => {
    const sql = hashedPassword
      ? "UPDATE user_details SET username=?, email=?, password=?, phone=?, address=? WHERE id=?"
      : "UPDATE user_details SET username=?, email=?, phone=?, address=? WHERE id=?";

    const params = hashedPassword
      ? [username, email, hashedPassword, phone, address, req.userId]
      : [username, email, phone, address, req.userId];

    db.query(sql, params, (err) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ success: "Profile updated" });
    });
  };

  if (password && password.trim() !== "") {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: "Password hashing error" });
      update(hash);
    });
  } else {
    update();
  }
};

//admins

exports.getAllUsers = (req, res) => {
  const query = 'SELECT id, username, email, phone, address FROM user_details';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
};

exports.adminUpdateUser = (req, res) => {
  const userId = req.params.id;
  const { username, email, phone, address, password } = req.body;

  let passwordHash = null;
  if (password) {
    passwordHash = bcrypt.hashSync(password, 10);
  }

  const sql = `
    UPDATE user_details
    SET username = ?, email = ?, phone = ?, address = ?, ${password ? "password = ?" : "password = password"}
    WHERE id = ?
  `;

  const params = password ? [username, email, phone, address, passwordHash, userId] : [username, email, phone, address, userId];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ error: "Failed to update user" });
    }

    res.json({ success: true, message: "User updated successfully" });
  });
};


exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  const sql = "DELETE FROM user_details WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ message: "Failed to delete user" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  });
};



