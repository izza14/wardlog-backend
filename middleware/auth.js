const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust path to your User model if needed

// 1. Verify the JWT Token from the frontend
exports.requireAuth = async (req, res, next) => {
  try {
    let token;

    // The frontend sends the token in the format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. No token provided.",
      });
    }

    // Verify the token using the secret in your .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the DB and attach to req.user (excluding the hashed password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized. Token is invalid or has expired.",
    });
  }
};

// Replace the existing role checks with these case-insensitive versions[cite: 7]:

exports.requireAdmin = (req, res, next) => {
  if (req.user.role.toLowerCase() !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin permissions required.",
    });
  }
  next();
};

exports.requireDoctor = (req, res, next) => {
  const role = req.user.role.toLowerCase();
  if (role !== "doctor" && role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Doctor permissions required.",
    });
  }
  next();
};

exports.requireNurse = (req, res, next) => {
  const role = req.user.role.toLowerCase();
  if (role !== "nurse" && role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Nurse permissions required.",
    });
  }
  next();
};
