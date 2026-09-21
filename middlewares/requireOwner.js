/**
 * Must run after verifyToken (relies on req.userRole being set there).
 */
const requireOwner = (req, res, next) => {
  if (req.userRole !== "owner") {
    return res.status(403).json({ message: "Resort owner access required." });
  }
  next();
};

module.exports = requireOwner;
