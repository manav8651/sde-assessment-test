const Joi = require("joi");

// User validation schemas
const userSchemas = {
  create: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required().messages({
      "string.alphanum": "Username must only contain alphanumeric characters",
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 50 characters",
      "any.required": "Username is required",
    }),
    email: Joi.string().email().max(100).required().messages({
      "string.email": "Please provide a valid email address",
      "string.max": "Email cannot exceed 100 characters",
      "any.required": "Email is required",
    }),
    full_name: Joi.string().min(1).max(100).required().messages({
      "string.min": "Full name cannot be empty",
      "string.max": "Full name cannot exceed 100 characters",
      "any.required": "Full name is required",
    }),
  }),

  update: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).optional(),
    email: Joi.string().email().max(100).optional(),
    full_name: Joi.string().min(1).max(100).optional(),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
};

// Task validation schemas
const taskSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required().messages({
      "string.min": "Title cannot be empty",
      "string.max": "Title cannot exceed 200 characters",
      "any.required": "Title is required",
    }),
    description: Joi.string().max(5000).optional().allow("", null).messages({
      "string.max": "Description cannot exceed 5000 characters",
    }),
    status: Joi.string()
      .valid("todo", "in-progress", "done")
      .default("todo")
      .messages({
        "any.only": "Status must be one of: todo, in-progress, done",
      }),
    priority: Joi.string()
      .valid("low", "medium", "high")
      .default("medium")
      .messages({
        "any.only": "Priority must be one of: low, medium, high",
      }),
    due_date: Joi.date().iso().greater("now").optional().allow(null).messages({
      "date.format": "Due date must be in ISO format (YYYY-MM-DD)",
      "date.greater": "Due date must be in the future",
    }),
    assigned_to: Joi.number()
      .integer()
      .positive()
      .optional()
      .allow(null)
      .messages({
        "number.base": "Assigned user ID must be a number",
        "number.integer": "Assigned user ID must be an integer",
        "number.positive": "Assigned user ID must be positive",
      }),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(5000).optional().allow("", null),
    status: Joi.string().valid("todo", "in-progress", "done").optional(),
    priority: Joi.string().valid("low", "medium", "high").optional(),
    due_date: Joi.date().iso().optional().allow(null).messages({
      "date.format": "Due date must be in ISO format (YYYY-MM-DD)",
    }),
    assigned_to: Joi.number().integer().positive().optional().allow(null),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),

  query: Joi.object({
    status: Joi.string().valid("todo", "in-progress", "done").optional(),
    priority: Joi.string().valid("low", "medium", "high").optional(),
    assignedTo: Joi.alternatives()
      .try(Joi.number().integer().positive(), Joi.string().valid("unassigned"))
      .optional(),
    search: Joi.string().max(100).optional().allow("").messages({
      "string.max": "Search term cannot exceed 100 characters",
    }),
    sortBy: Joi.string()
      .valid("created_at", "updated_at", "due_date", "title", "priority")
      .default("created_at"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
  }),
};

// Validation middleware factory
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

module.exports = {
  userSchemas,
  taskSchemas,
  validate,
};
