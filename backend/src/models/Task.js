const { query, getClient } = require("../config/database");

class Task {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.priority = data.priority;
    this.due_date = data.due_date;
    this.assigned_to = data.assigned_to;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.assigned_user = data.assigned_user; // For joined queries
  }

  // Create a new task
  static async create(taskData) {
    const {
      title,
      description,
      status = "todo",
      priority = "medium",
      due_date,
      assigned_to,
    } = taskData;

    try {
      const result = await query(
        "INSERT INTO tasks (title, description, status, priority, due_date, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [title, description, status, priority, due_date, assigned_to]
      );

      return new Task(result.rows[0]);
    } catch (error) {
      // Handle specific database errors
      if (error.code === "23503") {
        throw new Error("Assigned user does not exist");
      }
      if (error.code === "23514") {
        throw new Error("Invalid status or priority value");
      }
      throw error;
    }
  }

  // Get all tasks with filtering, searching, and sorting
  static async findAll(options = {}) {
    const {
      limit = 50,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "desc",
      status,
      priority,
      assignedTo,
      search,
    } = options;

    // Validate sort parameters
    const validSortFields = [
      "id",
      "title",
      "status",
      "priority",
      "due_date",
      "created_at",
      "updated_at",
    ];
    const validSortOrders = ["asc", "desc"];

    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const sortDirection = validSortOrders.includes(sortOrder.toLowerCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    // Build query
    let queryText = `
      SELECT t.*, u.username as assigned_user_name, u.full_name as assigned_user_full_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Add filters
    if (status) {
      conditions.push(`t.status = $${paramCount++}`);
      values.push(status);
    }

    if (priority) {
      conditions.push(`t.priority = $${paramCount++}`);
      values.push(priority);
    }

    if (assignedTo !== undefined) {
      if (assignedTo === "unassigned") {
        conditions.push(`t.assigned_to IS NULL`);
      } else if (assignedTo !== null) {
        conditions.push(`t.assigned_to = $${paramCount++}`);
        values.push(assignedTo);
      }
    }

    if (search) {
      conditions.push(
        `(t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`
      );
      values.push(`%${search}%`);
      paramCount++;
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add ORDER BY clause
    queryText += ` ORDER BY t.${sortField} ${sortDirection}`;

    // Add LIMIT and OFFSET
    queryText += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    try {
      const result = await query(queryText, values);

      return result.rows.map((row) => {
        const task = new Task(row);
        if (row.assigned_user_name) {
          task.assigned_user = {
            id: row.assigned_to,
            username: row.assigned_user_name,
            full_name: row.assigned_user_full_name,
          };
        }
        return task;
      });
    } catch (error) {
      throw error;
    }
  }

  // Get task by ID
  static async findById(id) {
    if (!id || !Number.isInteger(parseInt(id))) {
      throw new Error("Valid task ID is required");
    }

    try {
      const result = await query(
        `
        SELECT t.*, u.username as assigned_user_name, u.full_name as assigned_user_full_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.id = $1
      `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const task = new Task(row);
      if (row.assigned_user_name) {
        task.assigned_user = {
          id: row.assigned_to,
          username: row.assigned_user_name,
          full_name: row.assigned_user_full_name,
        };
      }
      return task;
    } catch (error) {
      throw error;
    }
  }

  // Get tasks by status
  static async findByStatus(status) {
    if (!["todo", "in-progress", "done"].includes(status)) {
      throw new Error("Invalid status value");
    }

    try {
      const result = await query(
        `
        SELECT t.*, u.username as assigned_user_name, u.full_name as assigned_user_full_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.status = $1
        ORDER BY t.created_at DESC
      `,
        [status]
      );

      return result.rows.map((row) => {
        const task = new Task(row);
        if (row.assigned_user_name) {
          task.assigned_user = {
            id: row.assigned_to,
            username: row.assigned_user_name,
            full_name: row.assigned_user_full_name,
          };
        }
        return task;
      });
    } catch (error) {
      throw error;
    }
  }

  // Get overdue tasks
  static async findOverdue() {
    try {
      const result = await query(`
        SELECT t.*, u.username as assigned_user_name, u.full_name as assigned_user_full_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.due_date < CURRENT_DATE AND t.status != 'done'
        ORDER BY t.due_date ASC
      `);

      return result.rows.map((row) => {
        const task = new Task(row);
        if (row.assigned_user_name) {
          task.assigned_user = {
            id: row.assigned_to,
            username: row.assigned_user_name,
            full_name: row.assigned_user_full_name,
          };
        }
        return task;
      });
    } catch (error) {
      throw error;
    }
  }

  // Update task
  async update(updateData) {
    const { title, description, status, priority, due_date, assigned_to } =
      updateData;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramCount++}`);
      values.push(due_date);
    }
    if (assigned_to !== undefined) {
      updateFields.push(`assigned_to = $${paramCount++}`);
      values.push(assigned_to);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(this.id);

    try {
      const result = await query(
        `UPDATE tasks SET ${updateFields.join(
          ", "
        )} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error("Task not found");
      }

      // Update current instance
      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      // Handle specific database errors
      if (error.code === "23503") {
        throw new Error("Assigned user does not exist");
      }
      if (error.code === "23514") {
        throw new Error("Invalid status or priority value");
      }
      throw error;
    }
  }

  // Delete task
  async delete() {
    try {
      const result = await query(
        "DELETE FROM tasks WHERE id = $1 RETURNING *",
        [this.id]
      );

      if (result.rows.length === 0) {
        throw new Error("Task not found");
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get task statistics
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
          COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'done' THEN 1 END) as done_tasks,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_tasks,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_tasks,
          COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'done' THEN 1 END) as overdue_tasks,
          COUNT(CASE WHEN assigned_to IS NULL THEN 1 END) as unassigned_tasks
        FROM tasks
      `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Bulk update tasks
  static async bulkUpdate(taskIds, updateData) {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error("Task IDs array is required");
    }

    const { status, priority, assigned_to } = updateData;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (assigned_to !== undefined) {
      updateFields.push(`assigned_to = $${paramCount++}`);
      values.push(assigned_to);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    // Create placeholders for task IDs
    const idPlaceholders = taskIds
      .map((_, index) => `$${paramCount + index}`)
      .join(",");
    values.push(...taskIds);

    try {
      const result = await query(
        `UPDATE tasks SET ${updateFields.join(
          ", "
        )} WHERE id IN (${idPlaceholders}) RETURNING *`,
        values
      );

      return result.rows.map((row) => new Task(row));
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    const json = {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      due_date: this.due_date,
      assigned_to: this.assigned_to,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };

    // Include assigned user information if available
    if (this.assigned_user) {
      json.assigned_user = this.assigned_user;
    }

    return json;
  }
}

module.exports = Task;
