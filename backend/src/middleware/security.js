const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
});

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: "Too many requests",
      details: message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: "Too many requests",
        details: message,
        retryAfter: Math.round(windowMs / 1000),
      });
    },
  });
};

// General API rate limiting
const apiLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  "Too many requests from this IP, please try again later"
);

// Stricter rate limiting for write operations
const writeLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // 20 requests per window
  "Too many write requests from this IP, please try again later"
);

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potentially dangerous characters from string inputs
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str.trim().replace(/[<>]/g, "");
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
      return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (typeof obj === "object") {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://yourdomain.com"] // Replace with your production domain
      : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = {
  securityHeaders,
  apiLimiter,
  writeLimiter,
  sanitizeInput,
  corsOptions,
};
