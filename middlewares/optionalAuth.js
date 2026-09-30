const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT;

// Like verifyToken, but never blocks the request. A valid token attaches
// req.userId/req.userRole; a missing or invalid one just continues as a
// guest. Used by routes -- like the chatbot -- that serve both logged-in
// and anonymous users, where auth changes WHAT the endpoint can do, not
// whether it's allowed to run.
const optionalAuth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return next();

  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (!err) {
      req.userId = decoded.id;
      req.userRole = decoded.role;
    }
    next();
  });
};

module.exports = optionalAuth;
