const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { userSchemas, validate } = require("../middleware/validation");
const { writeLimiter } = require("../middleware/security");

// Apply rate limiting to write operations
router.use("/", writeLimiter);

// GET /api/users - Get all users
router.get(
  "/",
  validate(userSchemas.query, "query"),
  UserController.getAllUsers
);

// GET /api/users/search - Search users
router.get("/search", UserController.searchUsers);

// GET /api/users/check-username/:username - Check username availability
router.get(
  "/check-username/:username",
  UserController.checkUsernameAvailability
);

// GET /api/users/check-email/:email - Check email availability
router.get("/check-email/:email", UserController.checkEmailAvailability);

// GET /api/users/:id - Get user by ID
router.get("/:id", UserController.getUserById);

// GET /api/users/:id/tasks - Get user's assigned tasks
router.get("/:id/tasks", UserController.getUserTasks);

// GET /api/users/:id/stats - Get user statistics
router.get("/:id/stats", UserController.getUserStats);

// POST /api/users - Create new user
router.post("/", validate(userSchemas.create), UserController.createUser);

// PUT /api/users/:id - Update user
router.put("/:id", validate(userSchemas.update), UserController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete("/:id", UserController.deleteUser);

module.exports = router;
