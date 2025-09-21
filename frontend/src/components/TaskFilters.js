import React, { useState, useEffect } from "react";
import { userAPI } from "../services/api";

const TaskFilters = ({ filters, onChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users for assignment filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userAPI.getUsers({ limit: 100 });
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    onChange({ [key]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    onChange({
      status: "",
      priority: "",
      assignedTo: "",
      search: "",
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.status || filters.priority || filters.assignedTo || filters.search;

  return (
    <div className="task-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear All
          </button>
        )}
      </div>

      <div className="filters-grid">
        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <label htmlFor="priority-filter">Priority</label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Assignment Filter */}
        <div className="filter-group">
          <label htmlFor="assigned-filter">Assignment</label>
          <select
            id="assigned-filter"
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
            className="filter-select"
            disabled={loading}
          >
            <option value="">All Tasks</option>
            <option value="unassigned">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="filter-group">
          <label htmlFor="sort-filter">Sort By</label>
          <select
            id="sort-filter"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="filter-select"
          >
            <option value="created_at">Created Date</option>
            <option value="updated_at">Updated Date</option>
            <option value="due_date">Due Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        {/* Sort Order Filter */}
        <div className="filter-group">
          <label htmlFor="order-filter">Order</label>
          <select
            id="order-filter"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            className="filter-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Limit Filter */}
        <div className="filter-group">
          <label htmlFor="limit-filter">Items per page</label>
          <select
            id="limit-filter"
            value={filters.limit}
            onChange={(e) =>
              handleFilterChange("limit", parseInt(e.target.value))
            }
            className="filter-select"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <h4>Active Filters:</h4>
          <div className="active-filter-tags">
            {filters.status && (
              <span className="filter-tag">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange("status", "")}
                  className="remove-filter-btn"
                >
                  ×
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="filter-tag">
                Priority: {filters.priority}
                <button
                  onClick={() => handleFilterChange("priority", "")}
                  className="remove-filter-btn"
                >
                  ×
                </button>
              </span>
            )}
            {filters.assignedTo && (
              <span className="filter-tag">
                Assigned:{" "}
                {filters.assignedTo === "unassigned"
                  ? "Unassigned"
                  : users.find((u) => u.id.toString() === filters.assignedTo)
                      ?.full_name || "Unknown"}
                <button
                  onClick={() => handleFilterChange("assignedTo", "")}
                  className="remove-filter-btn"
                >
                  ×
                </button>
              </span>
            )}
            {filters.search && (
              <span className="filter-tag">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange("search", "")}
                  className="remove-filter-btn"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .task-filters {
          background: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .filters-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .clear-filters-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .clear-filters-btn:hover {
          background: #dc2626;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-select:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .active-filters {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }

        .active-filters h4 {
          margin: 0 0 10px 0;
          color: #374151;
          font-size: 1rem;
          font-weight: 600;
        }

        .active-filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .remove-filter-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          padding: 0;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .remove-filter-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .filters-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .active-filter-tags {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskFilters;
