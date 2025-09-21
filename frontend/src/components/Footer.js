import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Task Management System</h3>
            <p>Built with React, Node.js, Express, and PostgreSQL</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>Task CRUD Operations</li>
                <li>Advanced Filtering</li>
                <li>User Assignment</li>
                <li>Priority Management</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Technology</h4>
              <ul>
                <li>React.js Frontend</li>
                <li>Node.js Backend</li>
                <li>PostgreSQL Database</li>
                <li>RESTful API</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="/api" target="_blank" rel="noopener noreferrer">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Health Check
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="mailto:support@example.com">Support</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {currentYear} Task Management System. All rights reserved.
          </p>
          <p className="footer-built-with">
            Built with ❤️ using modern web technologies
          </p>
        </div>
      </div>

      <style jsx>{`
        .app-footer {
          background: #1f2937;
          color: #d1d5db;
          padding: 40px 0 20px;
          margin-top: auto;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 40px;
          margin-bottom: 30px;
        }

        .footer-brand h3 {
          color: white;
          margin-bottom: 12px;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .footer-brand p {
          color: #9ca3af;
          line-height: 1.6;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .footer-section h4 {
          color: white;
          margin-bottom: 16px;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section li {
          margin-bottom: 8px;
        }

        .footer-section a {
          color: #d1d5db;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-section a:hover {
          color: white;
          text-decoration: underline;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          padding-top: 20px;
          text-align: center;
        }

        .footer-bottom p {
          margin: 0 0 8px 0;
          color: #9ca3af;
        }

        .footer-built-with {
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .footer-container {
            padding: 0 15px;
          }
        }

        @media (max-width: 480px) {
          .footer-links {
            grid-template-columns: 1fr;
          }

          .footer-section {
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
