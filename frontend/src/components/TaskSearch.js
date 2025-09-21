import React, { useState, useCallback } from "react";

const TaskSearch = ({ value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");

  // Debounced search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((term) => {
      onChange(term);
    }, 300),
    [onChange]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    debouncedSearch(newValue);
  };

  // Handle clear search
  const handleClear = () => {
    setSearchTerm("");
    onChange("");
  };

  return (
    <div className="task-search">
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search tasks by title or description..."
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>
        {searchTerm && (
          <button
            onClick={handleClear}
            className="clear-search-btn"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search suggestions/hints */}
      <div className="search-hints">
        <p>Search tips:</p>
        <ul>
          <li>Use keywords to find tasks by title or description</li>
          <li>Try searching for status: "todo", "in-progress", "done"</li>
          <li>Search by priority: "high", "medium", "low"</li>
          <li>Combine with filters for better results</li>
        </ul>
      </div>

      <style jsx>{`
        .task-search {
          width: 100%;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2rem;
          color: #6b7280;
          pointer-events: none;
        }

        .clear-search-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          transition: background-color 0.2s;
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-search-btn:hover {
          background: #dc2626;
        }

        .search-hints {
          margin-top: 12px;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
        }

        .search-hints p {
          margin: 0 0 8px 0;
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .search-hints ul {
          margin: 0;
          padding-left: 16px;
          color: #6b7280;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .search-hints li {
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .search-container {
            flex-direction: column;
            gap: 8px;
          }

          .search-input-wrapper {
            width: 100%;
          }

          .clear-search-btn {
            align-self: flex-end;
          }

          .search-hints {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default TaskSearch;
