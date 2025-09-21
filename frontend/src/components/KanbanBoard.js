import React, { useState } from "react";
import TaskCard from "./TaskCard";

const KanbanBoard = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onStatusChange,
  onPriorityChange,
  onAssignmentChange,
  getStatusColor,
  getPriorityColor,
}) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === "todo"),
    "in-progress": tasks.filter(task => task.status === "in-progress"),
    done: tasks.filter(task => task.status === "done"),
  };

  // Column configuration
  const columns = [
    {
      id: "todo",
      title: "To Do",
      color: "#6b7280",
      icon: "📝",
    },
    {
      id: "in-progress", 
      title: "In Progress",
      color: "#f59e0b",
      icon: "🔄",
    },
    {
      id: "done",
      title: "Done",
      color: "#10b981",
      icon: "✅",
    },
  ];

  // Handle drag start
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over
  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  // Handle drop
  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedTask && draggedTask.status !== columnId) {
      try {
        await onStatusChange(draggedTask.id, columnId);
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
    setDraggedTask(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className="kanban-board">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`kanban-column ${dragOverColumn === column.id ? "drag-over" : ""}`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div 
            className="column-header"
            style={{ borderTopColor: column.color }}
          >
            <div className="column-title">
              <span className="column-icon">{column.icon}</span>
              <h3>{column.title}</h3>
              <span 
                className="task-count"
                style={{ backgroundColor: column.color }}
              >
                {tasksByStatus[column.id].length}
              </span>
            </div>
          </div>

          <div className="column-content">
            {tasksByStatus[column.id].length === 0 ? (
              <div className="empty-column">
                <p>No tasks in {column.title.toLowerCase()}</p>
                <span className="drop-hint">Drop tasks here</span>
              </div>
            ) : (
              tasksByStatus[column.id].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className={`task-wrapper ${draggedTask?.id === task.id ? "dragging" : ""}`}
                >
                  <TaskCard
                    task={task}
                    onUpdate={onTaskUpdate}
                    onDelete={onTaskDelete}
                    onStatusChange={onStatusChange}
                    onPriorityChange={onPriorityChange}
                    onAssignmentChange={onAssignmentChange}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    isKanban={true}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      <style jsx>{`
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          height: calc(100vh - 300px);
          min-height: 600px;
        }

        .kanban-column {
          background: #f8fafc;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
          min-height: 0;
        }

        .kanban-column.drag-over {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .column-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          border-top: 4px solid transparent;
          border-radius: 12px 12px 0 0;
          background: white;
        }

        .column-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .column-icon {
          font-size: 1.5rem;
        }

        .column-title h3 {
          flex: 1;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .task-count {
          background: #6b7280;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 12px;
          min-width: 24px;
          text-align: center;
        }

        .column-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #6b7280;
          text-align: center;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 20px;
        }

        .empty-column p {
          margin: 0 0 8px 0;
          font-size: 1rem;
        }

        .drop-hint {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .task-wrapper {
          transition: all 0.2s ease;
          cursor: move;
        }

        .task-wrapper:hover {
          transform: translateY(-2px);
        }

        .task-wrapper.dragging {
          opacity: 0.5;
          transform: rotate(5deg) scale(1.05);
        }

        /* Custom scrollbar for columns */
        .column-content::-webkit-scrollbar {
          width: 6px;
        }

        .column-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .column-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .column-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media (max-width: 1024px) {
          .kanban-board {
            grid-template-columns: 1fr;
            height: auto;
            gap: 16px;
          }

          .column-content {
            max-height: 400px;
          }

          .empty-column {
            height: 120px;
          }
        }

        @media (max-width: 768px) {
          .kanban-board {
            gap: 12px;
          }

          .column-header {
            padding: 16px;
          }

          .column-content {
            padding: 16px;
            gap: 12px;
          }

          .column-title h3 {
            font-size: 1.125rem;
          }

          .column-icon {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default KanbanBoard;
