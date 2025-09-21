import React, { useState } from "react";
import { taskAPI } from "../services/api";

const TaskForm = ({ onClose, onTaskCreated, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "todo",
    priority: initialData?.priority || "medium",
    due_date: initialData?.due_date || "",
    assigned_to: initialData?.assigned_to || "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const taskData = {
        ...formData,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
      };

      if (initialData) {
        await taskAPI.updateTask(initialData.id, taskData);
      } else {
        await taskAPI.createTask(taskData);
      }
      
      onTaskCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-modal">
        <div className="task-form-header">
          <h3>{initialData ? "Edit Task" : "Create New Task"}</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="close-btn"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description (optional)"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="assigned_to">Assigned To (User ID)</label>
            <input
              type="number"
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleInputChange}
              placeholder="Enter user ID (optional)"
              min="1"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : (initialData ? "Update Task" : "Create Task")}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .task-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .task-form-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .task-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          margin-bottom: 24px;
        }

        .task-form-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-btn:hover:not(:disabled) {
          background: #f3f4f6;
          color: #374151;
        }

        .close-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .task-form {
          padding: 0 24px 24px;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
          background: white;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input:disabled,
        .form-group textarea:disabled,
        .form-group select:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-btn,
        .submit-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #374151;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .submit-btn {
          background: #3b82f6;
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .cancel-btn:disabled,
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .task-form-overlay {
            padding: 10px;
          }

          .task-form-header {
            padding: 20px 20px 0;
          }

          .task-form {
            padding: 0 20px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .cancel-btn,
          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskForm;
