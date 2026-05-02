const mongoose = require('mongoose');
//DUMMY AUTH MIDDLEWARE
exports.requireAuth = (req, res, next) => {
  req.user = {
    // Hardcode the ID so you stay the same person across all tests!
    id: "64abcdef1234567890abcdef", 
    role: 'Admin', // CHANGE THIS to 'Doctor' or 'Nurse' to test different roles!
    name: 'Test Dummy User'
  };
  
  console.log(`[Mock Auth] Simulating login as: ${req.user.role}`);
  next(); 
};

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

exports.requireDoctor = (req, res, next) => {
  if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Doctor only.' });
  }
  next();
};