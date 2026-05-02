const Settings = require('../models/Settings');
const Staff = require('../models/Staff');
const SwapRequest = require('../models/SwapRequest');
const Task = require('../models/Task');

// GET /api/admin/dashboard
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Aggregate stats: total staff, active wards, pending approvals, alerts[cite: 1]
    const totalStaff = await Staff.countDocuments({ status: 'Active' });
    const pendingApprovals = await SwapRequest.countDocuments({ status: 'Pending' });
    const highPriorityTasks = await Task.countDocuments({ priority: 'High', status: 'Pending' });

    res.status(200).json({
      success: true,
      data: {
        totalStaff,
        activeWards: 4, // Assuming static for dummy data scope
        pendingApprovals,
        alerts: highPriorityTasks > 5 ? 'High volume of pending urgent tasks' : 'Normal operations'
      },
      message: 'Admin dashboard stats retrieved'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/settings[cite: 1]
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); // Create default if none exists
    }
    res.status(200).json({ success: true, data: settings, message: 'Settings retrieved' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/settings[cite: 1]
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    Object.assign(settings, req.body);
    await settings.save();
    
    res.status(200).json({ success: true, data: settings, message: 'System settings updated' });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};