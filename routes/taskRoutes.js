const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { requireAuth, requireDoctor } = require("../middleware/auth");

router.get("/", requireAuth, taskController.getTasks);
router.post("/", requireAuth, requireDoctor, taskController.createTask);
router.put("/:id/complete", requireAuth, taskController.completeTask);
router.put("/:id", requireAuth, taskController.updateTask);
router.delete("/:id", requireAuth, taskController.deleteTask);

module.exports = router;
