const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/connectDB');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT;

exports.register = (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: "Hashing error" });

    const sql = "INSERT INTO user_details (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hash], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ success: "User registered successfully" });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const checkUser = (table, cb) => {
    db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], cb);
  };

  checkUser('user_details', (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    let user = result[0];
    if (!user) {
      checkUser('admin', (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });
        user = result[0];
        if (!user) return res.status(404).json({ message: "User not found" });

        handleLogin(user, password, res);
      });
    } else {
      handleLogin(user, password, res);
    }
  });
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
