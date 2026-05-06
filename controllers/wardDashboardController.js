const Task = require('../models/Task');
const Patient = require('../models/Patient'); 
const Staff = require('../models/Staff');

exports.getWardDashboard = async (req, res, next) => {
  try {
    // Safely get the logged-in user's ID
    const userId = req.user.id || req.user._id;

    // 1. Fetch actual patients for the bed map
    const patients = await Patient.find({ ward: { $in: ["Ward A", "Ward B", "Ward C"] } });    
    
    // 2. Calculate the exact stats the frontend expects
    const totalPatients = await Patient.countDocuments();
    const admittedPatients = patients.length;
    
    // THE FIX: Added `assignedTo: userId` so it ONLY counts YOUR active tasks (which will equal 2)
    const myTasks = await Task.countDocuments({ 
      assignedTo: userId, 
      status: { $ne: 'completed' } 
    });
    
    // THE FIX: Also ensure the urgent sub-counter only looks at YOUR urgent tasks
    const urgentTasks = await Task.countDocuments({ 
      assignedTo: userId, 
      priority: 'high', 
      status: { $ne: 'completed' } 
    });
    
    const activeStaff = await Staff.countDocuments({ status: 'Active' });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalPatients,
          admittedPatients,
          myTasks,       // <--- Will now correctly display 2
          urgentTasks,
          todayShifts: 4, 
          tomorrowShifts: 3, 
          activeStaff,
          department: "General Medicine"
        },
        patients: patients 
      },
      message: 'Ward dashboard loaded successfully'
    });
  } catch (error) {
    next(error); 
  }
};