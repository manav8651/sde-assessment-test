import React, { useState } from "react";
import { format, parseISO, isAfter, isBefore } from "date-fns";

const TaskCard = ({
  task,
  onUpdate,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onAssignmentChange,
  getStatusColor,
  getPriorityColor,
  isKanban = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    due_date: task.due_date || "",
  });

  // Check if task is overdue
  const isOverdue =
    task.due_date &&
    isBefore(parseISO(task.due_date), new Date()) &&
    task.status !== "done";

  // Handle edit toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditData({
        title: task.title,
        description: task.description,
        due_date: task.due_date || "",
      });
    }
  };

  // Handle save changes
  const handleSave = async () => {
    try {
      await onUpdate(task.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await onDelete(task.id);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  // Handle priority change
  const handlePriorityChange = async (newPriority) => {
    try {
      await onPriorityChange(task.id, newPriority);
    } catch (error) {
      console.error("Error changing priority:", error);
    }
  };

  return (
    <div className={`task-card ${isOverdue ? "overdue" : ""} ${isKanban ? "kanban-card" : ""}`}>
      {/* Task Header */}
      <div className="task-header">
        <div className="task-title-section">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="edit-input"
              placeholder="Task title"
            />
          ) : (
            <h3 className="task-title">{task.title}</h3>
          )}
          <div className="task-badges">
            <span
              className="status-badge"
              style={{ backgroundColor: getStatusColor(task.status) }}
            >
              {task.status.replace("-", " ")}
            </span>
            <span
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </span>
          </div>
        </div>
        <div className="task-actions">
          <button
            onClick={handleEditToggle}
            className="action-btn edit-btn"
            title={isEditing ? "Cancel" : "Edit"}
          >
            {isEditing ? "✕" : "✏️"}
          </button>
          <button
            onClick={handleDelete}
            className="action-btn delete-btn"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Task Description */}
      <div className="task-description">
        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className="edit-textarea"
            placeholder="Task description"
            rows="3"
          />
        ) : (
          <p>{task.description || "No description provided"}</p>
        )}
      </div>

      {/* Task Details */}
      <div className="task-details">
        {/* Due Date */}
        <div className="detail-item">
          <span className="detail-label">Due Date:</span>
          {isEditing ? (
            <input
              type="date"
              value={editData.due_date}
              onChange={(e) =>
                setEditData({ ...editData, due_date: e.target.value })
              }
              className="edit-input"
            />
          ) : (
            <span className={`due-date ${isOverdue ? "overdue" : ""}`}>
              {task.due_date
                ? format(parseISO(task.due_date), "MMM dd, yyyy")
                : "No due date"}
            </span>
          )}
        </div>

        {/* Assigned User */}
        <div className="detail-item">
          <span className="detail-label">Assigned:</span>
          <span className="assigned-user">
            {task.assigned_user ? task.assigned_user.full_name : "Unassigned"}
          </span>
        </div>

        {/* Created Date */}
        <div className="detail-item">
          <span className="detail-label">Created:</span>
          <span className="created-date">
            {format(parseISO(task.created_at), "MMM dd, yyyy")}
          </span>
        </div>
      </div>

      {/* Task Controls */}
      <div className="task-controls">
        {isEditing ? (
          <div className="edit-controls">
            <button onClick={handleSave} className="save-btn">
              Save Changes
            </button>
            <button onClick={handleEditToggle} className="cancel-btn">
              Cancel
            </button>
          </div>
        ) : (
          <div className="status-controls">
            {/* Status Dropdown */}
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-select"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={task.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="priority-select"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        )}
      </div>

      <style jsx>{`
        .task-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #e5e7eb;
          transition: all 0.2s ease;
          position: relative;
        }

        .task-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .task-card.overdue {
          border-left-color: #ef4444;
          background: #fef2f2;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .task-title-section {
          flex: 1;
        }

        .task-title {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.4;
        }

        .task-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .status-badge,
        .priority-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: white;
        }

        .task-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: none;
          border: none;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
        }

        .edit-btn:hover {
          background-color: #f3f4f6;
        }

        .delete-btn:hover {
          background-color: #fef2f2;
        }

        .task-description {
          margin-bottom: 15px;
          color: #4b5563;
          line-height: 1.5;
        }

        .task-description p {
          margin: 0;
        }

        .task-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
          font-size: 0.9rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-weight: 600;
          color: #6b7280;
        }

        .due-date.overdue {
          color: #ef4444;
          font-weight: 600;
        }

        .assigned-user {
          color: #1f2937;
        }

        .created-date {
          color: #6b7280;
        }

        .task-controls {
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
        }

        .edit-controls {
          display: flex;
          gap: 10px;
        }

        .save-btn,
        .cancel-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .save-btn {
          background-color: #10b981;
          color: white;
        }

        .save-btn:hover {
          background-color: #059669;
        }

        .cancel-btn {
          background-color: #6b7280;
          color: white;
        }

        .cancel-btn:hover {
          background-color: #4b5563;
        }

        .status-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .status-select,
        .priority-select {
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .edit-input,
        .edit-textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 1rem;
          font-family: inherit;
        }

        .edit-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .edit-input:focus,
        .edit-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Kanban-specific styles */
        .task-card.kanban-card {
          margin-bottom: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          cursor: move;
        }

        .task-card.kanban-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .task-card.kanban-card .task-badges {
          gap: 6px;
        }

        .task-card.kanban-card .status-badge {
          display: none; /* Hide status badge in kanban since column shows status */
        }

        .task-card.kanban-card .task-description {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: 4.5em;
          line-height: 1.5;
        }

        .task-card.kanban-card .status-controls {
          display: none; /* Hide status controls in kanban since drag-drop handles status */
        }

        @media (max-width: 768px) {
          .task-card {
            padding: 15px;
          }

          .task-header {
            flex-direction: column;
            gap: 10px;
          }

          .task-actions {
            align-self: flex-end;
          }

          .status-controls {
            flex-direction: column;
          }

          .status-select,
          .priority-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskCard;
