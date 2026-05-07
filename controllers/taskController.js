const Task = require("../models/Task");
const { createNotification } = require("./notificationController");

// 1. GET /api/tasks - List tasks (filtered by role)[cite: 1]
exports.getTasks = async (req, res, next) => {
  try {
    let filter = {};
    // Nurse: view assigned tasks only (My Tasks + To-Do)[cite: 1]
    if (req.user.role === "Nurse") {
      filter.assignedTo = req.user.id;
    }
    // Doctor/Admin: view all tasks[cite: 1]
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name role")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
      message: "Tasks retrieved successfully",
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
      createdBy: req.user.id,
      type,
      priority,
    });

    // 🔔 Notify the assigned user
    if (assignedTo) {
      await createNotification({
        recipientId: assignedTo, // Uses the User ID from assignedTo
        type: "task_assigned",
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${title}.`,
        relatedTask: newTask._id,
      });
    }

    res.status(201).json({
      success: true,
      data: newTask,
      message: "Task created and assigned successfully",
    });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// 3. PUT /api/tasks/:id/complete - Mark as complete (Nurse/Doctor)
exports.completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, data: null, message: "Task not found" });
    }

    task.status = "completed";
    task.history.push({
      status: "completed",
      updatedBy: req.user.id,
      timestamp: new Date(),
    });

    await task.save();

    // 🔔 Notify the creator (Doctor) that the task is finished
    if (task.createdBy) {
      await createNotification({
        recipientId: task.createdBy,
        type: "task_completed",
        title: "Task Completed",
        message: `The task "${task.title}" has been marked as completed by ${req.user.name}.`,
        relatedTask: task._id,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: "Task marked as complete",
    });
  } catch (error) {
    next(error);
  }
};

// 4. PUT /api/tasks/:id - Update task details (Doctor/Admin)[cite: 1]
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, data: null, message: "Task not found" });
    }

    // 🔔 Notify the assigned user about the update
    if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
      await createNotification({
        recipientId: task.assignedTo,
        type: "task_assigned",
        title: "Task Updated",
        message: `Your assigned task "${task.title}" has been updated.`,
        relatedTask: task._id,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: "Task details updated successfully",
    });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// 5. DELETE /api/tasks/:id - Delete task (Doctor or Nurse's own completed)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, data: null, message: "Task not found" });
    }

    // Nurse can only delete their own completed tasks
    if (req.user.role === "Nurse") {
      if (
        task.assignedTo.toString() !== req.user.id ||
        task.status !== "completed"
      ) {
        return res.status(403).json({
          success: false,
          data: null,
          message: "Nurses can only delete their own completed tasks",
        });
      }
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: null,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
