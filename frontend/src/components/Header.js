import React from "react";

const Header = ({ onNewTask, onShowStats }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-brand">
            <h1 className="header-title">📋 Task Manager</h1>
            <p className="header-subtitle">
              Organize, track, and manage your tasks efficiently
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="header-btn primary"
              onClick={onNewTask}
            >
              + New Task
            </button>
            <button 
              className="header-btn secondary"
              onClick={onShowStats}
            >
              📊 Stats
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .app-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .header-brand {
          flex: 1;
        }

        .header-title {
          margin: 0 0 8px 0;
          font-size: 2.5rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-subtitle {
          margin: 0;
          font-size: 1.1rem;
          opacity: 0.9;
          font-weight: 400;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .header-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .header-btn.primary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .header-btn.primary:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }

        .header-btn.secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .header-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }

          .header-title {
            font-size: 2rem;
          }

          .header-subtitle {
            font-size: 1rem;
          }

          .header-actions {
            width: 100%;
            justify-content: center;
          }

          .header-btn {
            flex: 1;
            max-width: 150px;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 0 15px;
          }

          .header-title {
            font-size: 1.75rem;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .header-btn {
            max-width: none;
            width: 100%;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
