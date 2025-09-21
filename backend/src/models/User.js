const { query, getClient } = require("../config/database");

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.full_name = data.full_name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { username, email, full_name } = userData;

    try {
      const result = await query(
        "INSERT INTO users (username, email, full_name) VALUES ($1, $2, $3) RETURNING *",
        [username, email, full_name]
      );

      return new User(result.rows[0]);
    } catch (error) {
      // Handle specific database errors
      if (error.code === "23505") {
        if (error.constraint === "users_username_key") {
          throw new Error("Username already exists");
        }
        if (error.constraint === "users_email_key") {
          throw new Error("Email already exists");
        }
      }
      throw error;
    }
  }

  // Get all users with optional pagination
  static async findAll(options = {}) {
    const {
      limit = 50,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "desc",
    } = options;

    // Validate sort parameters
    const validSortFields = [
      "id",
      "username",
      "email",
      "full_name",
      "created_at",
      "updated_at",
    ];
    const validSortOrders = ["asc", "desc"];

    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const sortDirection = validSortOrders.includes(sortOrder.toLowerCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    try {
      const result = await query(
        `SELECT * FROM users ORDER BY ${sortField} ${sortDirection} LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows.map((row) => new User(row));
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async findById(id) {
    if (!id || !Number.isInteger(parseInt(id))) {
      throw new Error("Valid user ID is required");
    }

    try {
      const result = await query("SELECT * FROM users WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get user by username
  static async findByUsername(username) {
    if (!username || typeof username !== "string") {
      throw new Error("Valid username is required");
    }

    try {
      const result = await query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get user by email
  static async findByEmail(email) {
    if (!email || typeof email !== "string") {
      throw new Error("Valid email is required");
    }

    try {
      const result = await query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async update(updateData) {
    const { username, email, full_name } = updateData;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (username !== undefined) {
      updateFields.push(`username = $${paramCount++}`);
      values.push(username);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (full_name !== undefined) {
      updateFields.push(`full_name = $${paramCount++}`);
      values.push(full_name);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(this.id);

    try {
      const result = await query(
        `UPDATE users SET ${updateFields.join(
          ", "
        )} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      // Update current instance
      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      // Handle specific database errors
      if (error.code === "23505") {
        if (error.constraint === "users_username_key") {
          throw new Error("Username already exists");
        }
        if (error.constraint === "users_email_key") {
          throw new Error("Email already exists");
        }
      }
      throw error;
    }
  }

  // Delete user
  async delete() {
    const client = await getClient();

    try {
      await client.query("BEGIN");

      // Set assigned tasks to NULL instead of deleting them
      await client.query(
        "UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1",
        [this.id]
      );

      // Delete the user
      const result = await client.query(
        "DELETE FROM users WHERE id = $1 RETURNING *",
        [this.id]
      );

      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user's assigned tasks
  async getAssignedTasks(options = {}) {
    const { limit = 50, offset = 0, status, priority } = options;

    let queryText = "SELECT * FROM tasks WHERE assigned_to = $1";
    const values = [this.id];
    let paramCount = 2;

    if (status) {
      queryText += ` AND status = $${paramCount++}`;
      values.push(status);
    }

    if (priority) {
      queryText += ` AND priority = $${paramCount++}`;
      values.push(priority);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    try {
      const result = await query(queryText, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  async getStats() {
    try {
      const result = await query(
        `
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
          COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'done' THEN 1 END) as done_tasks,
          COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'done' THEN 1 END) as overdue_tasks
        FROM tasks 
        WHERE assigned_to = $1
      `,
        [this.id]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON (excluding sensitive data)
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      full_name: this.full_name,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = User;
