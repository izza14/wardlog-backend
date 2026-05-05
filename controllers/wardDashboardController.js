const Task = require('../models/Task');
const Patient = require('../models/Patient'); // Added Patient model
const Staff = require('../models/Staff');

exports.getWardDashboard = async (req, res, next) => {
  try {
    // 1. Fetch actual patients for the bed map!
    const patients = await Patient.find({ ward: { $in: ["Ward A", "Ward B", "Ward C"] } });    
    // 2. Calculate the exact stats the frontend expects
    const totalPatients = await Patient.countDocuments();
    const admittedPatients = patients.length;
    
    // Ensure task query is case-insensitive to avoid previous strict-enum bugs
    const myTasks = await Task.countDocuments({ status: { $ne: 'completed' } });
    const urgentTasks = await Task.countDocuments({ priority: 'high', status: { $ne: 'completed' } });
    const activeStaff = await Staff.countDocuments({ status: 'Active' });

    res.status(200).json({
      success: true,
      data: {
        // Match the React state keys exactly
        stats: {
          totalPatients,
          admittedPatients,
          myTasks,
          urgentTasks,
          todayShifts: 4, // Placeholder until Roster query is added
          tomorrowShifts: 3, 
          activeStaff,
          department: "General Medicine"
        },
        // Send the raw patient array for the WardOccupancy map
        patients: patients 
      },
      message: 'Ward dashboard loaded successfully'
    });
  } catch (error) {
    next(error); 
  }
};