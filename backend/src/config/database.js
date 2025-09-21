const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "task_management",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin@123",
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
};

// Execute query with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error("Database query error:", err.message);
    throw err;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  try {
    return await pool.connect();
  } catch (err) {
    console.error("Error getting database client:", err.message);
    throw err;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};
