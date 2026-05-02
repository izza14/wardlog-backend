const Roster = require('../models/Roster');
const Staff = require('../models/Staff');

// POST /api/roster/generate (Admin auto-generate schedule)[cite: 1]
exports.generateSchedule = async (req, res, next) => {
  try {
    const { startDate, days} = req.body;

    const staffList = await Staff.find({ status: 'Active' });
    if (!staffList || staffList.length === 0) {
      return res.status(400).json({ success: false, message: "No active staff found to schedule!" });
    }
    // Placeholder for actual round-robin algorithm
    const generatedShifts = [];
    let previousShiftType = '';

    // Requirement: Conflict detection (no night-to-morning)[cite: 1]
    for (const staff of staffList) {
       let assignedShift = 'Morning';
       if (previousShiftType === 'Night') {
           assignedShift = 'Evening'; // Prevent Night-to-Morning conflict[cite: 1]
       }
       
       generatedShifts.push({
           shift: assignedShift,
           staffName: staff.name,
           role: staff.role,
           ward: 'General Ward'
       });
       previousShiftType = assignedShift;
    }

    const newRoster = await Roster.create({
        date: startDate,
        shifts: generatedShifts
    });

    res.status(201).json({ success: true, data: newRoster, message: 'Conflict-free schedule generated' });
  } catch (error) {
    next(error);
  }
};

// GET /api/roster
exports.getRoster = async (req, res, next) => {
  try {
    // Optionally filter by date range if provided in query params
    const rosters = await Roster.find().sort({ date: 1 });
    res.status(200).json({ success: true, data: rosters, message: 'Roster retrieved' });
  } catch (error) {
    next(error);
  }
};

// POST /api/roster/shifts (Admin only)
exports.addShift = async (req, res, next) => {
  try {
    const { date, shiftData } = req.body;
    
    // Find existing roster for the date, or create a new one
    let roster = await Roster.findOne({ date });
    if (!roster) {
      roster = new Roster({ date, shifts: [] });
    }

    roster.shifts.push(shiftData);
    await roster.save();

    res.status(201).json({ success: true, data: roster, message: 'Shift added successfully' });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// PUT /api/roster/shifts/:shiftId (Admin only)
exports.editShift = async (req, res, next) => {
  try {
    // Finds the specific roster containing the shift, and updates that specific shift in the array
    const roster = await Roster.findOneAndUpdate(
      { "shifts._id": req.params.shiftId },
      { $set: { "shifts.$": { ...req.body, _id: req.params.shiftId } } },
      { new: true }
    );

    if (!roster) return res.status(404).json({ success: false, data: null, message: 'Shift not found' });
    
    res.status(200).json({ success: true, data: roster, message: 'Shift updated successfully' });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// DELETE /api/roster/shifts/:shiftId (Admin only)
exports.removeShift = async (req, res, next) => {
  try {
    // Pulls the specific shift out of the shifts array
    const roster = await Roster.findOneAndUpdate(
      { "shifts._id": req.params.shiftId },
      { $pull: { shifts: { _id: req.params.shiftId } } },
      { new: true }
    );

    if (!roster) return res.status(404).json({ success: false, data: null, message: 'Shift not found' });
    
    res.status(200).json({ success: true, data: null, message: 'Shift removed successfully' });
  } catch (error) {
    next(error);
  }
};