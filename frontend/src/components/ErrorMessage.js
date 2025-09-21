import React from "react";

const ErrorMessage = ({ message, onRetry, type = "error" }) => {
  const getIcon = () => {
    switch (type) {
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "❌";
    }
  };

  const getColor = () => {
    switch (type) {
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      default:
        return "#ef4444";
    }
  };

  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">{getIcon()}</div>
        <div className="error-details">
          <h3 className="error-title">
            {type === "error"
              ? "Something went wrong"
              : type === "warning"
              ? "Warning"
              : "Information"}
          </h3>
          <p className="error-message">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="retry-btn">
              Try Again
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          min-height: 200px;
        }

        .error-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 400px;
          width: 100%;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .error-details {
          width: 100%;
        }

        .error-title {
          margin: 0 0 12px 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: ${getColor()};
        }

        .error-message {
          margin: 0 0 20px 0;
          color: #6b7280;
          line-height: 1.5;
          font-size: 1rem;
        }

        .retry-btn {
          background: ${getColor()};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-btn:hover {
          background: ${type === "error"
            ? "#dc2626"
            : type === "warning"
            ? "#d97706"
            : "#2563eb"};
          transform: translateY(-1px);
        }

        .retry-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .error-container {
            padding: 30px 15px;
            min-height: 150px;
          }

          .error-icon {
            font-size: 2.5rem;
            margin-bottom: 12px;
          }

          .error-title {
            font-size: 1.25rem;
            margin-bottom: 8px;
          }

          .error-message {
            font-size: 0.9rem;
            margin-bottom: 16px;
          }

          .retry-btn {
            padding: 8px 16px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorMessage;
