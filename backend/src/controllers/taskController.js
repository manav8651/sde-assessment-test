const Task = require("../models/Task");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorHandler");

class TaskController {
  // Get all tasks with filtering, searching, and sorting
  static getAllTasks = asyncHandler(async (req, res) => {
    const {
      status,
      priority,
      assignedTo,
      search,
      sortBy,
      sortOrder,
      limit,
      offset,
    } = req.query;

    const options = {
      status,
      priority,
      assignedTo,
      search,
      sortBy: sortBy || "created_at",
      sortOrder: sortOrder || "desc",
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    };

    const tasks = await Task.findAll(options);

    res.status(200).json({
      success: true,
      data: tasks,
      meta: {
        count: tasks.length,
        limit: options.limit,
        offset: options.offset,
        filters: {
          status,
          priority,
          assignedTo,
          search,
        },
        sorting: {
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
        },
      },
    });
  });

  // Get task by ID
  static getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
        details: `No task found with ID ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  });

  // Create new task
  static createTask = asyncHandler(async (req, res) => {
    const taskData = req.body;

    try {
      const task = await Task.create(taskData);

      res.status(201).json({
        success: true,
        data: task,
        message: "Task created successfully",
      });
    } catch (error) {
      // Handle specific validation errors
      if (error.message.includes("does not exist")) {
        return res.status(400).json({
          error: "Invalid assignment",
          details: error.message,
        });
      }
      if (error.message.includes("Invalid")) {
        return res.status(400).json({
          error: "Invalid data",
          details: error.message,
        });
      }
      throw error;
    }
  });

  // Update task
  static updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // First check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
        details: `No task found with ID ${id}`,
      });
    }

    try {
      await existingTask.update(updateData);

      res.status(200).json({
        success: true,
        data: existingTask,
        message: "Task updated successfully",
      });
    } catch (error) {
      // Handle specific validation errors
      if (error.message.includes("does not exist")) {
        return res.status(400).json({
          error: "Invalid assignment",
          details: error.message,
        });
      }
      if (error.message.includes("Invalid")) {
        return res.status(400).json({
          error: "Invalid data",
          details: error.message,
        });
      }
      throw error;
    }
  });

  // Delete task
  static deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // First check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
        details: `No task found with ID ${id}`,
      });
    }

    await existingTask.delete();

    res.status(204).send();
  });

  // Get tasks by status
  static getTasksByStatus = asyncHandler(async (req, res) => {
    const { status } = req.params;

    if (!["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        details: "Status must be one of: todo, in-progress, done",
      });
    }

    const tasks = await Task.findByStatus(status);

    res.status(200).json({
      success: true,
      data: tasks,
      meta: {
        count: tasks.length,
        status: status,
      },
    });
  });

  // Get overdue tasks
  static getOverdueTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.findOverdue();

    res.status(200).json({
      success: true,
      data: tasks,
      meta: {
        count: tasks.length,
        type: "overdue",
      },
    });
  });

  // Get task statistics
  static getTaskStats = asyncHandler(async (req, res) => {
    const stats = await Task.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // Bulk update tasks
  static bulkUpdateTasks = asyncHandler(async (req, res) => {
    const { taskIds, updateData } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        error: "Invalid task IDs",
        details: "Task IDs array is required",
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "Invalid update data",
        details: "Update data is required",
      });
    }

    try {
      const updatedTasks = await Task.bulkUpdate(taskIds, updateData);

      res.status(200).json({
        success: true,
        data: updatedTasks,
        message: `${updatedTasks.length} tasks updated successfully`,
      });
    } catch (error) {
      if (error.message.includes("does not exist")) {
        return res.status(400).json({
          error: "Invalid assignment",
          details: error.message,
        });
      }
      if (error.message.includes("Invalid")) {
        return res.status(400).json({
          error: "Invalid data",
          details: error.message,
        });
      }
      throw error;
    }
  });

  // Assign task to user
  static assignTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { assigned_to } = req.body;

    // First check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
        details: `No task found with ID ${id}`,
      });
    }

    // If assigned_to is provided, verify user exists
    if (assigned_to !== null && assigned_to !== undefined) {
      const user = await User.findById(assigned_to);
      if (!user) {
        return res.status(400).json({
          error: "User not found",
          details: `No user found with ID ${assigned_to}`,
        });
      }
    }

    try {
      await existingTask.update({ assigned_to });

      res.status(200).json({
        success: true,
        data: existingTask,
        message: assigned_to
          ? "Task assigned successfully"
          : "Task unassigned successfully",
      });
    } catch (error) {
      throw error;
    }
  });

  // Change task status
  static changeTaskStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        details: "Status must be one of: todo, in-progress, done",
      });
    }

    // First check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
        details: `No task found with ID ${id}`,
      });
    }

    try {
      await existingTask.update({ status });

      res.status(200).json({
        success: true,
        data: existingTask,
        message: "Task status updated successfully",
      });
    } catch (error) {
      throw error;
    }
  });

  // Change task priority
  static changeTaskPriority = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { priority } = req.body;

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        error: "Invalid priority",
        details: "Priority must be one of: low, medium, high",
      });
    }

    // First check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
        details: `No task found with ID ${id}`,
      });
    }

    try {
      await existingTask.update({ priority });

      res.status(200).json({
        success: true,
        data: existingTask,
        message: "Task priority updated successfully",
      });
    } catch (error) {
      throw error;
    }
  });

  // Search tasks with advanced filters
  static searchTasks = asyncHandler(async (req, res) => {
    const {
      q: searchTerm,
      status,
      priority,
      assignedTo,
      dueDateFrom,
      dueDateTo,
      sortBy,
      sortOrder,
      limit,
      offset,
    } = req.query;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return res.status(400).json({
        error: "Search term required",
        details: "Please provide a search term",
      });
    }

    // Build search options
    const options = {
      search: searchTerm.trim(),
      status,
      priority,
      assignedTo,
      sortBy: sortBy || "created_at",
      sortOrder: sortOrder || "desc",
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    };

    // Add date range filters if provided
    if (dueDateFrom || dueDateTo) {
      // This would require extending the Task.findAll method to support date ranges
      // For now, we'll use the existing search functionality
    }

    const tasks = await Task.findAll(options);

    res.status(200).json({
      success: true,
      data: tasks,
      meta: {
        count: tasks.length,
        searchTerm: searchTerm.trim(),
        filters: {
          status,
          priority,
          assignedTo,
          dueDateFrom,
          dueDateTo,
        },
        sorting: {
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
        },
        limit: options.limit,
        offset: options.offset,
      },
    });
  });
}

module.exports = TaskController;
