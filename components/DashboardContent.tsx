// components/DashboardContent.tsx
'use client'

import { useState } from 'react'

export default function DashboardContent() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-container">
          {/* Page Title */}
          <div className="page-title">
            <h1>Dashboard / My Dashboard</h1>
          </div>

          {/* Right Side Items */}
          <div className="nav-items">
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Search for..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="search-btn">
                  <span className="search-icon">🔍</span>
                </button>
              </div>
            </div>

            {/* User Menu */}
            <div className="user-menu">
              <button className="user-btn">
                <span className="user-name">Admin User</span>
                <span className="user-avatar">👤</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="page-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          {/* Messages Card */}
          <div className="stat-card primary">
            <div className="card-content">
              <div className="card-icon">✉️</div>
              <div className="card-info">
                <h3>26 New Messages!</h3>
                <p>Check your inbox</p>
              </div>
            </div>
            <button className="card-action">
              View Details <span className="arrow">→</span>
            </button>
          </div>

          {/* Reviews Card */}
          <div className="stat-card warning">
            <div className="card-content">
              <div className="card-icon">⭐</div>
              <div className="card-info">
                <h3>11 New Reviews!</h3>
                <p>See what patients say</p>
              </div>
            </div>
            <button className="card-action">
              View Details <span className="arrow">→</span>
            </button>
          </div>

          {/* Bookings Card */}
          <div className="stat-card success">
            <div className="card-content">
              <div className="card-icon">📅</div>
              <div className="card-info">
                <h3>10 New Bookings!</h3>
                <p>Manage appointments</p>
              </div>
            </div>
            <button className="card-action">
              View Details <span className="arrow">→</span>
            </button>
          </div>

          {/* Bookmarks Card */}
          <div className="stat-card danger">
            <div className="card-content">
              <div className="card-icon">❤️</div>
              <div className="card-info">
                <h3>10 New Bookmarks!</h3>
                <p>Saved items</p>
              </div>
            </div>
            <button className="card-action">
              View Details <span className="arrow">→</span>
            </button>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="statistics-section">
          <div className="section-header">
            <h2>📊 Statistic</h2>
            <div className="time-filter">
              <select className="filter-select">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart-placeholder">
              <div className="chart-content">
                <div className="chart-bars">
                  {[40000, 30000, 20000, 10000].map((value, index) => (
                    <div key={index} className="chart-bar-container">
                      <div 
                        className="chart-bar"
                        style={{ height: `${(value / 40000) * 100}%` }}
                      ></div>
                      <span className="chart-value">${value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="chart-labels">
                  <span>Q1</span>
                  <span>Q2</span>
                  <span>Q3</span>
                  <span>Q4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f8fafc;
        }
        
        /* Top Navigation */
        .top-nav {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          height: 80px;
        }
        
        .page-title h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .nav-items {
          display: flex;
          align-items: center;
          gap: 25px;
        }
        
        .search-container {
          display: flex;
        }
        
        .search-box {
          display: flex;
          background: #f8fafc;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }
        
        .search-box:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-input {
          border: none;
          background: none;
          padding: 12px 18px;
          outline: none;
          width: 300px;
          font-size: 14px;
          color: #1e293b;
        }
        
        .search-input::placeholder {
          color: #94a3b8;
        }
        
        .search-btn {
          background: none;
          border: none;
          padding: 12px 18px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .search-btn:hover {
          color: #3b82f6;
          background: #f1f5f9;
        }
        
        .user-menu {
          display: flex;
        }
        
        .user-btn {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px 15px;
          border-radius: 10px;
          transition: all 0.3s;
          gap: 10px;
        }
        
        .user-btn:hover {
          background: #f1f5f9;
        }
        
        .user-name {
          color: #1e293b;
          font-size: 14px;
          font-weight: 500;
        }
        
        .user-avatar {
          font-size: 20px;
        }
        
        /* Page Content */
        .page-content {
          padding: 30px;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        
        .stat-card.primary {
          border-left: 4px solid #3b82f6;
        }
        
        .stat-card.warning {
          border-left: 4px solid #f59e0b;
        }
        
        .stat-card.success {
          border-left: 4px solid #10b981;
        }
        
        .stat-card.danger {
          border-left: 4px solid #ef4444;
        }
        
        .card-content {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .card-icon {
          font-size: 40px;
          margin-right: 15px;
          opacity: 0.8;
        }
        
        .card-info h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .card-info p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        
        .card-action {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .card-action:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .arrow {
          font-weight: bold;
        }
        
        /* Statistics Section */
        .statistics-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          border: 1px solid #f1f5f9;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #475569;
          font-size: 14px;
        }
        
        .chart-container {
          margin-top: 20px;
        }
        
        .chart-placeholder {
          height: 300px;
          background: #f8fafc;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chart-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        .chart-bars {
          display: flex;
          align-items: end;
          gap: 40px;
          height: 200px;
        }
        
        .chart-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .chart-bar {
          width: 40px;
          background: linear-gradient(to top, #3b82f6, #60a5fa);
          border-radius: 4px 4px 0 0;
          transition: all 0.3s;
          min-height: 20px;
        }
        
        .chart-bar:hover {
          opacity: 0.8;
        }
        
        .chart-value {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }
        
        .chart-labels {
          display: flex;
          gap: 40px;
        }
        
        .chart-labels span {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          width: 40px;
          text-align: center;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .nav-container {
            padding: 0 20px;
            height: 70px;
          }
          
          .page-title h1 {
            font-size: 20px;
          }
          
          .page-content {
            padding: 20px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .search-input {
            width: 200px;
          }
          
          .user-name {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          .nav-container {
            padding: 0 15px;
          }
          
          .page-content {
            padding: 15px;
          }
          
          .search-container {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}