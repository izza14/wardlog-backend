const Task = require('../models/Task');

// 1. GET /api/tasks - List tasks (filtered by role)[cite: 1]
exports.getTasks = async (req, res, next) => {
  try {
    let filter = {};
    // Nurse: view assigned tasks only (My Tasks + To-Do)[cite: 1]
    if (req.user.role === 'Nurse') {
      filter.assignedTo = req.user.id;
    }
    // Doctor/Admin: view all tasks[cite: 1]

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name role')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      data: tasks, 
      message: 'Tasks retrieved successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// 2. POST /api/tasks - Create task (doctor only)[cite: 1]
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, type, priority } = req.body;

    const newTask = await Task.create({
      title,
      description,
      assignedTo,
      createdBy: req.user.id, // Authenticated doctor[cite: 1]
      type,
      priority
    });

    res.status(201).json({ 
      success: true, 
      data: newTask, 
      message: 'Task created and assigned successfully' 
    });
  } catch (error) {
    error.status = 400; // Validation failure[cite: 2]
    next(error);
  }
};

// 3. PUT /api/tasks/:id/complete - Mark task complete (Nurse/Doctor)[cite: 1]
// 3. PUT /api/tasks/:id/complete - Mark as complete (Nurse/Doctor)
exports.completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, data: null, message: 'Task not found' });
    }

    // THE FIX: Must be exactly "completed" (lowercase) to match the Task.js enum
    task.status = 'completed'; 
    
    // SRS Requirement: Maintain history for status updates
    task.history.push({ 
      status: 'completed', // THE FIX: lowercase here too
      updatedBy: req.user.id, 
      timestamp: new Date() 
    });
    
    await task.save();
    
    res.status(200).json({ 
      success: true, 
      data: task, 
      message: 'Task marked as complete' 
    });
  } catch (error) {
    next(error);
  }
};

// 4. PUT /api/tasks/:id - Update task details (Doctor/Admin)[cite: 1]
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, data: null, message: 'Task not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: task, 
      message: 'Task details updated successfully' 
    });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// 5. DELETE /api/tasks/:id - Delete task (doctor only)[cite: 1]
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ success: false, data: null, message: 'Task not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: null, 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};