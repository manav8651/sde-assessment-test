const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController");
const { taskSchemas, validate } = require("../middleware/validation");
const { writeLimiter } = require("../middleware/security");

// Apply rate limiting to write operations
router.use("/", writeLimiter);

// GET /api/tasks - Get all tasks with filtering and sorting
router.get(
  "/",
  validate(taskSchemas.query, "query"),
  TaskController.getAllTasks
);

// GET /api/tasks/search - Search tasks
router.get("/search", TaskController.searchTasks);

// GET /api/tasks/stats - Get task statistics
router.get("/stats", TaskController.getTaskStats);

// GET /api/tasks/overdue - Get overdue tasks
router.get("/overdue", TaskController.getOverdueTasks);

// GET /api/tasks/status/:status - Get tasks by status
router.get("/status/:status", TaskController.getTasksByStatus);

// GET /api/tasks/:id - Get task by ID
router.get("/:id", TaskController.getTaskById);

// POST /api/tasks - Create new task
router.post("/", validate(taskSchemas.create), TaskController.createTask);

// PUT /api/tasks/:id - Update task
router.put("/:id", validate(taskSchemas.update), TaskController.updateTask);

// PATCH /api/tasks/:id/assign - Assign task to user
router.patch("/:id/assign", TaskController.assignTask);

// PATCH /api/tasks/:id/status - Change task status
router.patch("/:id/status", TaskController.changeTaskStatus);

// PATCH /api/tasks/:id/priority - Change task priority
router.patch("/:id/priority", TaskController.changeTaskPriority);

// POST /api/tasks/bulk-update - Bulk update tasks
router.post("/bulk-update", TaskController.bulkUpdateTasks);

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", TaskController.deleteTask);

module.exports = router;
