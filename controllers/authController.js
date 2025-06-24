const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/connectDB');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT;

exports.register = (req, res) => {
  const { username, email, password, role = "user" } = req.body;

  const checkEmailSql = "SELECT * FROM user_details WHERE email = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: "Hashing error" });

      const insertSql = "INSERT INTO user_details (username, email, password, role) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [username, email, hash, role], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        res.json({ success: "User registered successfully" });
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required" });
  }

  const checkUser = (table, cb) => {
    db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], cb);
  };

  if (role === "admin") {
    // Admin login logic
    checkUser("admin", (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      const user = result[0];
      if (!user) return res.status(404).json({ message: "Admin not found" });
      handleLogin(user, password, res);
    });
  } else {
    // Regular user or resort owner
    checkUser("user_details", (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      const user = result[0];
      if (!user || user.role !== role) {
        return res.status(403).json({ message: `No ${role} account associated with this email` });
      }
      handleLogin(user, password, res);
    });
  }
};

const handleLogin = (user, password, res) => {
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err || !isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role || 'user' },
      JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      success: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
      }
    });
  });
};
