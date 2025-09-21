const express = require("express");
const router = express.Router();

// Import route modules
const userRoutes = require("./userRoutes");
const taskRoutes = require("./taskRoutes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Management API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API documentation endpoint
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Management API",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      users: {
        getAll: "GET /api/users",
        getById: "GET /api/users/:id",
        create: "POST /api/users",
        update: "PUT /api/users/:id",
        delete: "DELETE /api/users/:id",
        search: "GET /api/users/search",
        getUserTasks: "GET /api/users/:id/tasks",
        getUserStats: "GET /api/users/:id/stats",
        checkUsername: "GET /api/users/check-username/:username",
        checkEmail: "GET /api/users/check-email/:email",
      },
      tasks: {
        getAll: "GET /api/tasks",
        getById: "GET /api/tasks/:id",
        create: "POST /api/tasks",
        update: "PUT /api/tasks/:id",
        delete: "DELETE /api/tasks/:id",
        search: "GET /api/tasks/search",
        getByStatus: "GET /api/tasks/status/:status",
        getOverdue: "GET /api/tasks/overdue",
        getStats: "GET /api/tasks/stats",
        assign: "PATCH /api/tasks/:id/assign",
        changeStatus: "PATCH /api/tasks/:id/status",
        changePriority: "PATCH /api/tasks/:id/priority",
        bulkUpdate: "POST /api/tasks/bulk-update",
      },
    },
    documentation: "See API_REQUIREMENTS.md for detailed documentation",
  });
});

// Mount route modules
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);

module.exports = router;
