const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");
const {
  securityHeaders,
  apiLimiter,
  sanitizeInput,
  corsOptions,
} = require("./middleware/security");

// Import database connection
const { testConnection } = require("./config/database");

// Import routes
const apiRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api", apiRoutes);

// Serve static files (for frontend in production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/build/index.html"));
  });
}

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💾 Database: Connected to PostgreSQL`);
      console.log(`📝 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
