const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/connectDB");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT;

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hash],
    );

    res.json({ success: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    let user = result[0];

    if (!user) {
      result = await db.query("SELECT * FROM admin WHERE email = $1", [email]);
      user = result[0];
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await handleLogin(user, password, res);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const handleLogin = async (user, password, res) => {
  try {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
      JWT_SECRET_KEY,
      { expiresIn: "1h" },
    );

    res.json({
      success: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("Password compare error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
