/**
 * Must run after verifyToken (relies on req.userRole being set there).
 */
const requireAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};

module.exports = requireAdmin;
