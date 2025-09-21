import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error);

    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          throw new Error(data.details || data.error || "Bad request");
        case 401:
          throw new Error("Unauthorized access");
        case 403:
          throw new Error("Forbidden");
        case 404:
          throw new Error(data.details || "Resource not found");
        case 409:
          throw new Error(data.details || "Conflict - resource already exists");
        case 429:
          throw new Error("Too many requests. Please try again later.");
        case 500:
          throw new Error("Internal server error");
        default:
          throw new Error(data.error || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Network error - please check your connection");
    } else {
      // Something else happened
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
);

// User API functions
export const userAPI = {
  // Get all users
  getUsers: (params = {}) => api.get("/users", { params }),

  // Get user by ID
  getUser: (id) => api.get(`/users/${id}`),

  // Create user
  createUser: (userData) => api.post("/users", userData),

  // Update user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),

  // Delete user
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Search users
  searchUsers: (searchTerm, params = {}) =>
    api.get("/users/search", { params: { q: searchTerm, ...params } }),

  // Get user tasks
  getUserTasks: (id, params = {}) => api.get(`/users/${id}/tasks`, { params }),

  // Get user stats
  getUserStats: (id) => api.get(`/users/${id}/stats`),

  // Check username availability
  checkUsername: (username) => api.get(`/users/check-username/${username}`),

  // Check email availability
  checkEmail: (email) => api.get(`/users/check-email/${email}`),
};

// Task API functions
export const taskAPI = {
  // Get all tasks with filters
  getTasks: (params = {}) => api.get("/tasks", { params }),

  // Get task by ID
  getTask: (id) => api.get(`/tasks/${id}`),

  // Create task
  createTask: (taskData) => api.post("/tasks", taskData),

  // Update task
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),

  // Delete task
  deleteTask: (id) => api.delete(`/tasks/${id}`),

  // Search tasks
  searchTasks: (searchTerm, params = {}) =>
    api.get("/tasks/search", { params: { q: searchTerm, ...params } }),

  // Get tasks by status
  getTasksByStatus: (status) => api.get(`/tasks/status/${status}`),

  // Get overdue tasks
  getOverdueTasks: () => api.get("/tasks/overdue"),

  // Get task statistics
  getTaskStats: () => api.get("/tasks/stats"),

  // Assign task
  assignTask: (id, assignedTo) =>
    api.patch(`/tasks/${id}/assign`, { assigned_to: assignedTo }),

  // Change task status
  changeTaskStatus: (id, status) =>
    api.patch(`/tasks/${id}/status`, { status }),

  // Change task priority
  changeTaskPriority: (id, priority) =>
    api.patch(`/tasks/${id}/priority`, { priority }),

  // Bulk update tasks
  bulkUpdateTasks: (taskIds, updateData) =>
    api.post("/tasks/bulk-update", { taskIds, updateData }),
};

// Health check
export const healthCheck = () => api.get("/health");

export default api;
