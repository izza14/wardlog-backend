const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" }); //1 day auto-logout requirement
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      role: { $regex: new RegExp(`^${role}$`, "i") } 
    });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or role selected",
      });
    }

    // Log timestamp and IP (Audit requirement)
    console.log(
      `Login: ${user.email} (${user.role}) at ${new Date().toISOString()} from ${req.ip}`,
    );

    const token = generateToken(user._id);
    res.json({
      success: true,
      data: { token, user: { id: user._id, role: user.role, name: user.name } },
      message: "Login successful",
    });
  } catch (error) {
    console.log(
      `Login error for email: ${email}, role: ${role} - ${error.message}`,
    );
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  console.log(
    `Logout: User ${req.user.id} (${req.user.role}) at ${new Date().toISOString()}`,
  );
  res.json({ success: true, message: "Logged out successfully" });
};

exports.getMe = async (req, res) => {
  console.log(
    `Get Me: User ${req.user.id} (${req.user.role}) at ${new Date().toISOString()}`,
  );
  res.json({ success: true, data: req.user, message: "User retrieved" });
};
