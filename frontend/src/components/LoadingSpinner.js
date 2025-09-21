import React from "react";

const LoadingSpinner = ({ message = "Loading...", size = "medium" }) => {
  return (
    <div className={`loading-container ${size}`}>
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-message">{message}</p>

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .loading-container.small {
          padding: 20px;
        }

        .loading-container.large {
          padding: 80px 20px;
        }

        .spinner {
          display: inline-block;
          position: relative;
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
        }

        .loading-container.small .spinner {
          width: 32px;
          height: 32px;
          margin-bottom: 8px;
        }

        .loading-container.large .spinner {
          width: 96px;
          height: 96px;
          margin-bottom: 24px;
        }

        .spinner-ring {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid #e5e7eb;
          border-radius: 50%;
          animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: #e5e7eb transparent transparent transparent;
        }

        .spinner-ring:nth-child(1) {
          animation-delay: -0.45s;
        }

        .spinner-ring:nth-child(2) {
          animation-delay: -0.3s;
        }

        .spinner-ring:nth-child(3) {
          animation-delay: -0.15s;
        }

        .loading-message {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          text-align: center;
        }

        .loading-container.small .loading-message {
          font-size: 0.9rem;
        }

        .loading-container.large .loading-message {
          font-size: 1.2rem;
        }

        @keyframes spinner-ring {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .loading-container {
            padding: 30px 15px;
          }

          .spinner {
            width: 48px;
            height: 48px;
          }

          .loading-message {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
