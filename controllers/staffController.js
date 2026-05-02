const Staff = require('../models/Staff');

// GET /api/staff (Searchable and viewable by all roles)[cite: 1, 2]
exports.getAllStaff = async (req, res, next) => {
  try {
    const { search, role, department } = req.query;
    let filter = {};

    // Implements the searchable requirement
    if (search) {
      filter.name = { $regex: search, $options: 'i' }; 
    }
    if (role) filter.role = role;
    if (department) filter.department = department;

    const staff = await Staff.find(filter).sort({ role: 1, name: 1 }); // Grouped by role naturally
    res.status(200).json({ success: true, data: staff, message: 'Staff directory retrieved' });
  } catch (error) {
    next(error);
  }
};

// POST /api/staff (Admin only)
exports.addStaff = async (req, res, next) => {
  try {
    const newStaff = await Staff.create(req.body);
    res.status(201).json({ success: true, data: newStaff, message: 'Staff member added' });
  } catch (error) {
    error.status = 400; // Validation failure[cite: 1]
    next(error);
  }
};

// PUT /api/staff/:id (Admin only)
exports.updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ success: false, data: null, message: 'Staff member not found' });
    
    res.status(200).json({ success: true, data: staff, message: 'Staff updated successfully' });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// DELETE /api/staff/:id (Admin only)
exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ success: false, data: null, message: 'Staff member not found' });
    
    res.status(200).json({ success: true, data: null, message: 'Staff deleted successfully' });
  } catch (error) {
    next(error);
  }
};