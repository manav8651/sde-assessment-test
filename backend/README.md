# Task Management API Backend

A robust RESTful API built with Node.js, Express, and PostgreSQL for managing tasks and users.

## 🏗️ Architecture

The backend follows MVC (Model-View-Controller) architecture with clear separation of concerns:

```
src/
├── config/          # Database configuration and connection
├── controllers/     # Business logic and request handling
├── middleware/      # Validation, security, and error handling
├── models/          # Data models and database operations
├── routes/          # API route definitions
└── server.js        # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (via Docker Compose)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=password

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key-here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup

The database is automatically set up via Docker Compose. It includes:

- Pre-configured schema with users and tasks tables
- Sample data for testing
- Optimized indexes for performance
- Automatic timestamp updates

## 📚 API Endpoints

### Users API

| Method | Endpoint               | Description                   |
| ------ | ---------------------- | ----------------------------- |
| GET    | `/api/users`           | Get all users with pagination |
| GET    | `/api/users/:id`       | Get user by ID                |
| POST   | `/api/users`           | Create new user               |
| PUT    | `/api/users/:id`       | Update user                   |
| DELETE | `/api/users/:id`       | Delete user                   |
| GET    | `/api/users/search`    | Search users                  |
| GET    | `/api/users/:id/tasks` | Get user's assigned tasks     |
| GET    | `/api/users/:id/stats` | Get user statistics           |

### Tasks API

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| GET    | `/api/tasks`                | Get all tasks with filtering |
| GET    | `/api/tasks/:id`            | Get task by ID               |
| POST   | `/api/tasks`                | Create new task              |
| PUT    | `/api/tasks/:id`            | Update task                  |
| DELETE | `/api/tasks/:id`            | Delete task                  |
| PATCH  | `/api/tasks/:id/status`     | Change task status           |
| PATCH  | `/api/tasks/:id/assign`     | Assign/unassign task         |
| PATCH  | `/api/tasks/:id/priority`   | Change task priority         |
| POST   | `/api/tasks/bulk-update`    | Bulk update tasks            |
| GET    | `/api/tasks/search`         | Search tasks                 |
| GET    | `/api/tasks/stats`          | Get task statistics          |
| GET    | `/api/tasks/overdue`        | Get overdue tasks            |
| GET    | `/api/tasks/status/:status` | Get tasks by status          |

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── user.test.js      # User API tests
├── task.test.js      # Task API tests
└── integration.test.js # Integration tests
```

### Test Coverage

The test suite covers:

- ✅ All API endpoints
- ✅ Input validation
- ✅ Error handling
- ✅ Edge cases
- ✅ Database operations
- ✅ Security features

## 🔒 Security Features

### Input Validation

- **Joi Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **Data Type Validation**: Strict type checking

### Rate Limiting

- **API Rate Limiting**: 100 requests per 15 minutes
- **Write Operations**: 20 requests per 15 minutes
- **IP-based Limiting**: Per-IP rate limits

### Security Headers

- **Helmet.js**: Security headers
- **CORS**: Configured for frontend domains
- **Content Security Policy**: XSS protection

## 🛠️ Development

### Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Code Quality

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Supertest**: HTTP testing

## 📊 Performance

### Database Optimization

- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Optimized SQL queries
- **Indexes**: Performance indexes on key fields
- **Pagination**: Prevents large result sets

### Caching Strategy

- **Query Result Caching**: Intelligent caching
- **Database Connection Pooling**: Reuse connections
- **Response Compression**: Gzip compression

## 🚨 Error Handling

### Error Types

1. **Validation Errors** (400): Invalid input data
2. **Not Found** (404): Resource doesn't exist
3. **Conflict** (409): Duplicate unique constraints
4. **Rate Limit** (429): Too many requests
5. **Server Error** (500): Internal server errors

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## 🔧 Middleware

### Custom Middleware

- **Validation Middleware**: Request validation using Joi
- **Error Handler**: Global error handling
- **Security Middleware**: Rate limiting and security headers
- **Logging Middleware**: Request/response logging

### Built-in Middleware

- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Rate Limiting**: Request rate limiting
- **Body Parsing**: JSON and URL-encoded parsing

## 📝 Data Models

### User Model

```javascript
{
  id: number,
  username: string (unique),
  email: string (unique),
  full_name: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Task Model

```javascript
{
  id: number,
  title: string (required),
  description: string,
  status: 'todo' | 'in-progress' | 'done',
  priority: 'low' | 'medium' | 'high',
  due_date: date,
  assigned_to: number (user ID),
  created_at: timestamp,
  updated_at: timestamp
}
```

## 🚀 Deployment

### Production Setup

1. Set production environment variables
2. Configure database connection
3. Enable security features
4. Set up monitoring and logging
5. Configure reverse proxy (nginx)

### Docker Support

```bash
# Build Docker image
docker build -t task-management-api .

# Run container
docker run -p 3001:3001 task-management-api
```

## 📈 Monitoring

### Health Check

```bash
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "Task Management API is running",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### Logging

- **Request Logging**: All API requests logged
- **Error Logging**: Detailed error information
- **Performance Logging**: Query execution times
- **Security Logging**: Rate limit and security events

## 🔄 API Versioning

Current version: `v1.0.0`

Future versions will be backward compatible and available at:

- `/api/v1/...` (current)
- `/api/v2/...` (future)

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
