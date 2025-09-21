const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Database errors
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique constraint violation
        return res.status(409).json({
          error: "Duplicate entry",
          details: "A record with this information already exists",
        });

      case "23503": // Foreign key constraint violation
        return res.status(400).json({
          error: "Invalid reference",
          details: "Referenced record does not exist",
        });

      case "23502": // Not null constraint violation
        return res.status(400).json({
          error: "Missing required field",
          details: err.message,
        });

      case "23514": // Check constraint violation
        return res.status(400).json({
          error: "Invalid value",
          details: "Value does not meet the required constraints",
        });

      case "ECONNREFUSED":
        return res.status(503).json({
          error: "Database connection failed",
          details: "Unable to connect to the database",
        });

      default:
        console.error("Unhandled database error:", err.code);
        return res.status(500).json({
          error: "Database error",
          details: "An unexpected database error occurred",
        });
    }
  }

  // Validation errors (from Joi)
  if (err.isJoi) {
    const errors = err.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  // JSON parsing errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON",
      details: "Request body contains invalid JSON",
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// 404 handler for undefined routes
const notFound = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    details: `Cannot ${req.method} ${req.path}`,
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};
