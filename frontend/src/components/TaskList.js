import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { taskAPI } from "../services/api";
import KanbanBoard from "./KanbanBoard";
import TaskFilters from "./TaskFilters";
import TaskSearch from "./TaskSearch";
import TaskForm from "./TaskForm";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { format } from "date-fns";

const TaskList = forwardRef((props, ref) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignedTo: "",
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
    limit: 50,
    offset: 0,
  });

  // Fetch tasks based on current filters
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { ...filters };
      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await taskAPI.getTasks(params);
      setTasks(response.data.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks when filters change
  useEffect(() => {
    fetchTasks();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset pagination when filters change
    }));
  };

  // Handle task updates
  const handleTaskUpdate = async (taskId, updateData) => {
    try {
      await taskAPI.updateTask(taskId, updateData);
      // Refresh the task list
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  // Handle task deletion
  const handleTaskDelete = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      // Remove task from local state
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.changeTaskStatus(taskId, newStatus);
      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error changing task status:", err);
      throw err;
    }
  };

  // Handle priority change
  const handlePriorityChange = async (taskId, newPriority) => {
    try {
      await taskAPI.changeTaskPriority(taskId, newPriority);
      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, priority: newPriority } : task
        )
      );
    } catch (err) {
      console.error("Error changing task priority:", err);
      throw err;
    }
  };

  // Handle assignment change
  const handleAssignmentChange = async (taskId, assignedTo) => {
    try {
      await taskAPI.assignTask(taskId, assignedTo);
      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, assigned_to: assignedTo } : task
        )
      );
    } catch (err) {
      console.error("Error changing task assignment:", err);
      throw err;
    }
  };

  // Handle task creation/editing
  const handleTaskFormSubmit = () => {
    fetchTasks(); // Refresh task list
    setShowTaskForm(false);
    setEditingTask(null);
  };

  // Handle opening task form for editing
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Handle opening new task form
  const handleNewTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openNewTaskForm: handleNewTask,
  }));

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "#6b7280";
      case "in-progress":
        return "#f59e0b";
      case "done":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "high":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTasks} />;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div className="header-content">
          <div>
            <h2>Task Management</h2>
            <p>Manage and track your tasks efficiently</p>
          </div>
          <button 
            className="new-task-btn"
            onClick={handleNewTask}
          >
            <span>+</span>
            New Task
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="task-list-controls">
        <TaskSearch
          value={filters.search}
          onChange={(search) => handleFilterChange({ search })}
        />
        <TaskFilters filters={filters} onChange={handleFilterChange} />
      </div>

      {/* Kanban Board */}
      {tasks.length === 0 ? (
        <div className="no-tasks">
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or create a new task.</p>
          <button 
            className="create-first-task-btn"
            onClick={handleNewTask}
          >
            Create Your First Task
          </button>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onAssignmentChange={handleAssignmentChange}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          onEditTask={handleEditTask}
        />
      )}

      {/* Task Statistics */}
      {tasks.length > 0 && (
        <div className="task-statistics">
          <div className="stat-item">
            <span className="stat-label">Total Tasks:</span>
            <span className="stat-value">{tasks.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Todo:</span>
            <span
              className="stat-value"
              style={{ color: getStatusColor("todo") }}
            >
              {tasks.filter((t) => t.status === "todo").length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">In Progress:</span>
            <span
              className="stat-value"
              style={{ color: getStatusColor("in-progress") }}
            >
              {tasks.filter((t) => t.status === "in-progress").length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Done:</span>
            <span
              className="stat-value"
              style={{ color: getStatusColor("done") }}
            >
              {tasks.filter((t) => t.status === "done").length}
            </span>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onTaskCreated={handleTaskFormSubmit}
          initialData={editingTask}
        />
      )}

      <style jsx>{`
        .task-list-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .task-list-header {
          margin-bottom: 30px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .task-list-header h2 {
          color: #1f2937;
          margin-bottom: 8px;
          font-size: 2rem;
          font-weight: 700;
        }

        .task-list-header p {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .new-task-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }

        .new-task-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }

        .new-task-btn span {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .task-list-controls {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .no-tasks {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .no-tasks h3 {
          margin-bottom: 10px;
          font-size: 1.5rem;
        }

        .create-first-task-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 20px;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }

        .create-first-task-btn:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
        }

        .task-statistics {
          display: flex;
          justify-content: center;
          gap: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .task-list-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
            gap: 16px;
          }

          .new-task-btn {
            align-self: center;
          }

          .task-statistics {
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
});

export default TaskList;
