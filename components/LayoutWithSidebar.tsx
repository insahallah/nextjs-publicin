// components/LayoutWithSidebar.tsx
'use client'

import { ReactNode, useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function LayoutWithSidebar({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="layout-wrapper">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {!sidebarCollapsed && <h3 className="brand">FINDOCTOR</h3>}
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {/* Dashboard */}
            <li className="nav-item active">
              <a href="#" className="nav-link">
                <span className="nav-icon">📊</span>
                {!sidebarCollapsed && <span className="nav-text">Dashboard</span>}
              </a>
            </li>

            {/* Messages */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="nav-icon">✉️</span>
                {!sidebarCollapsed && <span className="nav-text">Messages</span>}
              </a>
            </li>

            {/* Bookings */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="nav-icon">📅</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="nav-text">Bookings</span>
                    <span className="nav-badge">6 New</span>
                  </>
                )}
              </a>
            </li>

            {/* Reviews */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="nav-icon">⭐</span>
                {!sidebarCollapsed && <span className="nav-text">Reviews</span>}
              </a>
            </li>

            {/* Bookmarks */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="nav-icon">❤️</span>
                {!sidebarCollapsed && <span className="nav-text">Bookmarks</span>}
              </a>
            </li>

            {/* Add Listing */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="nav-icon">➕</span>
                {!sidebarCollapsed && <span className="nav-text">Add listing</span>}
              </a>
            </li>

            {/* Divider */}
            <li className="nav-divider"></li>

            {/* My Profile Dropdown */}
            <li className="nav-item dropdown">
              <a href="#" className="nav-link">
                <span className="nav-icon">🔧</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="nav-text">My profile</span>
                    <span className="dropdown-arrow">▼</span>
                  </>
                )}
              </a>
            </li>

            {/* Components Dropdown */}
            <li className="nav-item dropdown">
              <a href="#" className="nav-link">
                <span className="nav-icon">⚙️</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="nav-text">Components</span>
                    <span className="dropdown-arrow">▼</span>
                  </>
                )}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {children}
      </div>

      <style jsx>{`
        .layout-wrapper {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
        }
        
        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background: #1e293b;
          color: white;
          transition: all 0.3s ease;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 1000;
          border-right: 1px solid #334155;
        }
        
        .sidebar.collapsed {
          width: 70px;
        }
        
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #334155;
          height: 70px;
        }
        
        .brand {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
          color: white;
        }
        
        .collapse-btn {
          background: #334155;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .collapse-btn:hover {
          background: #475569;
        }
        
        .sidebar-nav {
          padding: 20px 0;
          height: calc(100vh - 70px);
          overflow-y: auto;
        }
        
        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .nav-item {
          margin-bottom: 2px;
          position: relative;
        }
        
        .nav-item.active .nav-link {
          background: #3b82f6;
          color: white;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.2s;
          font-size: 15px;
          font-weight: 500;
          position: relative;
        }
        
        .nav-link:hover {
          background: #334155;
          color: white;
        }
        
        .nav-icon {
          width: 24px;
          font-size: 18px;
          text-align: center;
          margin-right: 12px;
        }
        
        .sidebar.collapsed .nav-icon {
          margin-right: 0;
        }
        
        .nav-text {
          flex: 1;
          font-size: 15px;
          font-weight: 500;
        }
        
        .nav-badge {
          background: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 8px;
        }
        
        .nav-divider {
          height: 1px;
          background: #334155;
          margin: 15px 20px;
        }
        
        .dropdown-arrow {
          font-size: 12px;
          color: #94a3b8;
          transition: transform 0.3s;
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 280px;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
        }
        
        .main-content.collapsed {
          margin-left: 70px;
        }
        
        /* Scrollbar */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar-nav::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 2px;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          
          .sidebar.collapsed {
            transform: translateX(-100%);
            width: 280px;
          }
          
          .main-content {
            margin-left: 0;
          }
          
          .main-content.collapsed {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  )
}