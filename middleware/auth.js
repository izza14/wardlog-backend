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

// 2. Require Admin Role
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin permissions required.",
    });
  }
  next();
};

// 3. Require Doctor Role (Admins usually get doctor access too)
exports.requireDoctor = (req, res, next) => {
  if (req.user.role !== "Doctor" && req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Doctor permissions required.",
    });
  }
  next();
};

// 4. Require Nurse Role (Admins usually get nurse access too)
exports.requireNurse = (req, res, next) => {
  if (req.user.role !== "Nurse" && req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Nurse permissions required.",
    });
  }
  next();
};
