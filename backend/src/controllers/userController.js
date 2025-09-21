const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorHandler");

class UserController {
  // Get all users
  static getAllUsers = asyncHandler(async (req, res) => {
    const { limit, offset, sortBy, sortOrder } = req.query;

    const options = {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      sortBy: sortBy || "created_at",
      sortOrder: sortOrder || "desc",
    };

    const users = await User.findAll(options);

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        count: users.length,
        limit: options.limit,
        offset: options.offset,
      },
    });
  });

  // Get user by ID
  static getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        details: `No user found with ID ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  // Create new user
  static createUser = asyncHandler(async (req, res) => {
    const userData = req.body;

    try {
      const user = await User.create(userData);

      res.status(201).json({
        success: true,
        data: user,
        message: "User created successfully",
      });
    } catch (error) {
      // Handle specific validation errors
      if (error.message.includes("already exists")) {
        return res.status(409).json({
          error: "Duplicate entry",
          details: error.message,
        });
      }
      throw error;
    }
  });

  // Update user
  static updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // First check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
        details: `No user found with ID ${id}`,
      });
    }

    try {
      await existingUser.update(updateData);

      res.status(200).json({
        success: true,
        data: existingUser,
        message: "User updated successfully",
      });
    } catch (error) {
      // Handle specific validation errors
      if (error.message.includes("already exists")) {
        return res.status(409).json({
          error: "Duplicate entry",
          details: error.message,
        });
      }
      throw error;
    }
  });

  // Delete user
  static deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // First check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
        details: `No user found with ID ${id}`,
      });
    }

    await existingUser.delete();

    res.status(204).send();
  });

  // Get user's assigned tasks
  static getUserTasks = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit, offset, status, priority } = req.query;

    // First check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        details: `No user found with ID ${id}`,
      });
    }

    const options = {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      status,
      priority,
    };

    const tasks = await user.getAssignedTasks(options);

    res.status(200).json({
      success: true,
      data: {
        user: user,
        tasks: tasks,
      },
      meta: {
        taskCount: tasks.length,
        limit: options.limit,
        offset: options.offset,
      },
    });
  });

  // Get user statistics
  static getUserStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // First check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        details: `No user found with ID ${id}`,
      });
    }

    const stats = await user.getStats();

    res.status(200).json({
      success: true,
      data: {
        user: user,
        statistics: stats,
      },
    });
  });

  // Search users
  static searchUsers = asyncHandler(async (req, res) => {
    const { q: searchTerm, limit = 20, offset = 0 } = req.query;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return res.status(400).json({
        error: "Search term required",
        details: "Please provide a search term",
      });
    }

    // Build search query
    const searchPattern = `%${searchTerm.trim()}%`;

    const result = await User.query(
      `
      SELECT * FROM users 
      WHERE username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1
      ORDER BY 
        CASE 
          WHEN username ILIKE $2 THEN 1
          WHEN full_name ILIKE $2 THEN 2
          WHEN email ILIKE $2 THEN 3
          ELSE 4
        END,
        created_at DESC
      LIMIT $3 OFFSET $4
    `,
      [
        searchPattern,
        `%${searchTerm.trim()}%`,
        parseInt(limit),
        parseInt(offset),
      ]
    );

    const users = result.rows.map((row) => new User(row));

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        count: users.length,
        searchTerm: searchTerm,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  });

  // Check username availability
  static checkUsernameAvailability = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        error: "Username required",
        details: "Please provide a username to check",
      });
    }

    const existingUser = await User.findByUsername(username.trim());

    res.status(200).json({
      success: true,
      data: {
        username: username.trim(),
        available: !existingUser,
      },
    });
  });

  // Check email availability
  static checkEmailAvailability = asyncHandler(async (req, res) => {
    const { email } = req.params;

    if (!email || email.trim().length === 0) {
      return res.status(400).json({
        error: "Email required",
        details: "Please provide an email to check",
      });
    }

    const existingUser = await User.findByEmail(email.trim());

    res.status(200).json({
      success: true,
      data: {
        email: email.trim(),
        available: !existingUser,
      },
    });
  });
}

module.exports = UserController;
