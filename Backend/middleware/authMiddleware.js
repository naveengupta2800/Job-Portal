const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = function requireAuth(role = null) {
  return async (req, res, next) => {
    try {
      let token = req.session?.token;

      // also accept Authorization header
      if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // FIX HERE (changed userId → id)
      req.userId = decoded.userId;

      if (role) {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role !== role) return res.status(403).json({ message: "Forbidden" });
        req.user = user;
      }

      next();
    } catch (err) {
      console.log("Auth error", err);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
