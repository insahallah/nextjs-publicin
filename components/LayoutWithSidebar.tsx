// components/LayoutWithSidebar.tsx
'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface LayoutProps {
  children: ReactNode
}

interface UserData {
  id: string
  fullName: string
  mobile: string
  city?: string
  village?: string
}

export default function LayoutWithSidebar({ children }: LayoutProps) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
    
    window.addEventListener('userLoggedIn', handleUserLoggedIn)
    window.addEventListener('userLoggedOut', handleUserLoggedOut)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn)
      window.removeEventListener('userLoggedOut', handleUserLoggedOut)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const checkAuthStatus = () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken')
        const userData = localStorage.getItem('userData')
        
        if (token && userData) {
          setIsLoggedIn(true)
          setUser(JSON.parse(userData))
        } else {
          setIsLoggedIn(false)
          setUser(null)
          // 🔥 DIRECT HOME REDIRECT WHEN NOT LOGGED IN
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsLoggedIn(false)
      setUser(null)
      // 🔥 DIRECT HOME REDIRECT ON ERROR
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserLoggedIn = (event: any) => {
    setIsLoggedIn(true)
    setUser(event.detail?.user || null)
    setShowUserDropdown(false)
  }

  const handleUserLoggedOut = () => {
    setIsLoggedIn(false)
    setUser(null)
    setShowUserDropdown(false)
    // 🔥 DIRECT HOME REDIRECT AFTER LOGOUT
    router.push('/')
  }

  const handleStorageChange = () => {
    checkAuthStatus()
  }

  const handleLoginClick = () => {
    window.dispatchEvent(new Event('openLoginModalFromLayout'))
  }

  // Home page redirect function
  const goToHomePage = () => {
    router.push('/')
  }

  // Logout function with home redirect
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    
    setIsLoggedIn(false)
    setUser(null)
    setShowUserDropdown(false)
    
    window.dispatchEvent(new CustomEvent('userLoggedOut'))
    window.dispatchEvent(new Event('storage'))
    
    // 🔥 DIRECT HOME REDIRECT AFTER LOGOUT
    router.push('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserDropdown])

  const toggleUserDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowUserDropdown(!showUserDropdown)
  }

  // Direct mobile logout
  const handleMobileLogout = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleLogout()
  }

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setMobileSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(false)
    }
  }

  // Listen for login modal requests
  useEffect(() => {
    const handleOpenLoginModalFromLayout = () => {
      handleLoginClick()
    }

    window.addEventListener('openLoginModalFromLayout', handleOpenLoginModalFromLayout)
    
    return () => {
      window.removeEventListener('openLoginModalFromLayout', handleOpenLoginModalFromLayout)
    }
  }, [])

  // 🔥 COMPLETELY REMOVED LOGIN REQUIRED SECTION
  // Now automatically redirects to home if not logged in

  // Show loading or redirect - no login prompt
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      )
    }

    // If not logged in, component will automatically redirect to home
    // So we only show children when logged in
    return isLoggedIn ? children : null
  }

  return (
    <div className="layout-wrapper">
      {/* Top Header Bar with Home Link */}
      {isLoggedIn && user && (
        <div className="top-header-bar">
          <div className="top-header-content">
            {/* Left Side - Home Link & Page Title */}
            <div className="header-left">
              <div className="home-and-title">
                {/* HOME LINK */}
                <button 
                  onClick={goToHomePage}
                  className="home-link-btn"
                  title="Go to Home Page"
                >
                  <span className="home-icon">🏠</span>
                  <span className="home-text">Home</span>
                </button>
                
                <h1 className="page-title">Dashboard</h1>
              </div>
            </div>

            <div className="header-right">
              <div className="user-info-container" style={{ position: 'relative' }}>
                <button
                  onClick={toggleUserDropdown}
                  className="user-dropdown-trigger"
                  title="User Menu"
                >
                  <div className="user-avatar-small">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.fullName}</span>
                  <i className={`dropdown-arrow ${showUserDropdown ? 'rotated' : ''}`}>▼</i>
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-avatar">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="dropdown-user-details">
                        <div className="dropdown-user-name">{user.fullName}</div>
                        <div className="dropdown-user-mobile">{user.mobile}</div>
                        {user.city && (
                          <div className="dropdown-user-location">{user.city}</div>
                        )}
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="dropdown-links">
                      {/* HOME LINK IN DROPDOWN */}
                      <button 
                        onClick={goToHomePage}
                        className="dropdown-link home-dropdown-link"
                      >
                        <span className="link-icon">🏠</span>
                        Home Page
                      </button>
                      
                      <a 
                        href="/UserDashboard" 
                        className="dropdown-link"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <span className="link-icon">📊</span>
                        Dashboard
                      </a>
                      
                      <a 
                        href="/profile" 
                        className="dropdown-link"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <span className="link-icon">👤</span>
                        My Profile
                      </a>
                      
                      <a 
                        href="/my-businesses" 
                        className="dropdown-link"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <span className="link-icon">🏢</span>
                        My Businesses
                      </a>
                    </div>

                    <div className="dropdown-divider"></div>

                    <button
                      onClick={handleLogout}
                      className="dropdown-logout-btn"
                    >
                      <span className="link-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header with Home Link */}
      {isMobile && isLoggedIn && (
        <div className="mobile-header">
          <button 
            className="menu-toggle-btn"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          
          {/* HOME LINK IN MOBILE HEADER */}
          <button 
            onClick={goToHomePage}
            className="mobile-home-btn"
            title="Home"
          >
            <h3 className="mobile-brand">🏠 PUBLICIN</h3>
          </button>
          
          {isLoggedIn && user && (
            <div className="mobile-user-actions">
              <div className="user-info-mobile">
                <span className="user-greet">Hi, {user.fullName.split(' ')[0]}</span>
              </div>
              
              <button
                onClick={handleMobileLogout}
                className="mobile-logout-btn"
                title="Logout"
              >
                <svg className="logout-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span className="logout-text">Logout</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && mobileSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar - Only show when logged in */}
      {isLoggedIn && (
        <div 
          className={`
            sidebar 
            ${sidebarCollapsed ? 'collapsed' : ''}
            ${isMobile ? 'mobile' : ''}
            ${isMobile && mobileSidebarOpen ? 'mobile-open' : ''}
          `}
        >
          <div className="sidebar-header">
            {(!sidebarCollapsed || isMobile) && (
              <button 
                onClick={goToHomePage}
                className="sidebar-home-btn"
                title="Home"
              >
                <h3 className="brand">🏠 PUBLICIN</h3>
              </button>
            )}
            <button 
              className="collapse-btn"
              onClick={toggleSidebar}
            >
              {sidebarCollapsed && !isMobile ? '→' : '←'}
            </button>
          </div>

          {(!sidebarCollapsed || isMobile) && user && (
            <div className="user-profile">
              <div className="user-avatar">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">{user.fullName}</div>
                <div className="user-mobile">{user.mobile}</div>
                {user.city && <div className="user-location">{user.city}</div>}
              </div>
            </div>
          )}

          <nav className="sidebar-nav">
            <ul className="nav-list">
              {/* HOME LINK IN SIDEBAR */}
              <li className="nav-item">
                <button 
                  onClick={goToHomePage}
                  className="nav-link home-nav-link"
                >
                  <span className="nav-icon">🏠</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">Home Page</span>}
                </button>
              </li>

              <li className="nav-item active">
                <a href="/UserDashboard" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">📊</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">Dashboard</span>}
                </a>
              </li>

              <li className="nav-item">
                <a href="#" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">✉️</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">Messages</span>}
                </a>
              </li>

              <li className="nav-item">
                <a href="#" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">📅</span>
                  {(!sidebarCollapsed || isMobile) && (
                    <>
                      <span className="nav-text">Bookings</span>
                      <span className="nav-badge">6 New</span>
                    </>
                  )}
                </a>
              </li>

              <li className="nav-item">
                <a href="#" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">⭐</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">Reviews</span>}
                </a>
              </li>

              <li className="nav-item">
                <a href="#" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">❤️</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">Bookmarks</span>}
                </a>
              </li>

              <li className="nav-item">
                <a href="/list-your-business" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">➕</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">Add listing</span>}
                </a>
              </li>

              <li className="nav-divider"></li>

              <li className="nav-item">
                <a href="/profile" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">👤</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">My Profile</span>}
                </a>
              </li>

              <li className="nav-item">
                <a href="/my-businesses" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">🏢</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">My Businesses</span>}
                </a>
              </li>

              <li className="nav-item logout-item">
                <a href="#" className="nav-link" onClick={(e) => { 
                  e.preventDefault(); 
                  handleLogout(); 
                  closeMobileSidebar(); 
                }}>
                  <span className="nav-icon">🚪</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">Logout</span>}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div 
        className={`
          main-content 
          ${sidebarCollapsed && !isMobile && isLoggedIn ? 'collapsed' : ''}
          ${isMobile ? 'mobile' : ''}
          ${!isLoggedIn ? 'full-width' : ''}
          ${isLoggedIn ? 'with-top-header' : ''}
        `}
      >
        {renderContent()}
      </div>

      {/* COMPLETE CSS STYLES */}
      <style jsx>{`
        .layout-wrapper {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        /* Loading State */
        .loading-content {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f8f9fa;
        }
        
        .loading-spinner {
          font-size: 18px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .loading-spinner::before {
          content: '';
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Top Header Bar */
        .top-header-bar {
          position: fixed;
          top: 0;
          left: ${isLoggedIn ? (sidebarCollapsed ? '70px' : '280px') : '0'};
          right: 0;
          height: 70px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          z-index: 900;
          transition: left 0.3s ease;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .top-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 30px;
          max-width: 100%;
        }
        
        .header-left {
          flex: 1;
        }
        
        .home-and-title {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .home-link-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f0f8ff;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #3b82f6;
          font-weight: 500;
          font-size: 14px;
        }
        
        .home-link-btn:hover {
          background: #3b82f6;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .home-icon {
          font-size: 16px;
        }
        
        .home-text {
          font-weight: 600;
        }
        
        .page-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }
        
        .header-right {
          display: flex;
          align-items: center;
        }
        
        /* User Dropdown Styles */
        .user-info-container {
          position: relative;
        }
        
        .user-dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          background: none;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #374151;
        }
        
        .user-dropdown-trigger:hover {
          background: #f8fafc;
        }
        
        .user-avatar-small {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
        }
        
        .dropdown-arrow {
          font-size: 12px;
          color: #64748b;
          transition: transform 0.3s ease;
        }
        
        .dropdown-arrow.rotated {
          transform: rotate(180deg);
        }
        
        .user-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          min-width: 280px;
          z-index: 1001;
          margin-top: 8px;
          overflow: hidden;
        }
        
        .dropdown-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .dropdown-user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .dropdown-user-details {
          flex: 1;
          min-width: 0;
        }
        
        .dropdown-user-name {
          font-weight: 700;
          color: #1e293b;
          font-size: 16px;
          margin-bottom: 2px;
        }
        
        .dropdown-user-mobile {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 2px;
        }
        
        .dropdown-user-location {
          color: #94a3b8;
          font-size: 12px;
        }
        
        .dropdown-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0;
        }
        
        .dropdown-links {
          padding: 8px 0;
        }
        
        .dropdown-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          color: #374151;
          text-decoration: none;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          font-family: inherit;
          cursor: pointer;
        }
        
        .dropdown-link:hover {
          background: #f8fafc;
          color: #3b82f6;
        }
        
        .link-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }
        
        .dropdown-logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 20px;
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
        }
        
        .dropdown-logout-btn:hover {
          background: #fef2f2;
          color: #b91c1c;
        }
        
        /* Mobile Header */
        .mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 999;
          height: 60px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .menu-toggle-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          margin-right: 16px;
          border-radius: 6px;
          transition: background 0.2s;
          color: #374151;
        }
        
        .menu-toggle-btn:hover {
          background: #f1f5f9;
        }
        
        .mobile-home-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
        }
        
        .mobile-brand {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
          color: #1e293b;
        }
        
        .mobile-user-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .user-info-mobile {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #475569;
        }
        
        .user-greet {
          font-weight: 500;
          color: #374151;
        }
        
        /* Mobile Logout Button */
        .mobile-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #dc2626;
          font-size: 13px;
          font-weight: 500;
        }
        
        .mobile-logout-btn:hover {
          background: #fecaca;
          border-color: #fca5a5;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
        }
        
        .logout-icon {
          width: 16px;
          height: 16px;
          color: #dc2626;
          flex-shrink: 0;
        }
        
        .logout-text {
          font-weight: 600;
          font-size: 13px;
        }
        
        /* Sidebar Overlay */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
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
        
        .sidebar.mobile {
          transform: translateX(-100%);
          width: 280px;
        }
        
        .sidebar.mobile.mobile-open {
          transform: translateX(0);
        }
        
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #334155;
          height: 70px;
        }
        
        .sidebar-home-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
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
        
        /* User Profile in Sidebar */
        .user-profile {
          padding: 20px;
          border-bottom: 1px solid #334155;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .user-details {
          flex: 1;
          min-width: 0;
        }
        
        .user-name {
          font-weight: 600;
          color: white;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .user-mobile {
          color: #cbd5e1;
          font-size: 12px;
          margin-top: 2px;
        }
        
        .user-location {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 2px;
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
        
        .nav-item.logout-item {
          margin-top: 10px;
          border-top: 1px solid #334155;
          padding-top: 10px;
        }
        
        .nav-item.logout-item .nav-link {
          color: #ef4444;
        }
        
        .nav-item.logout-item .nav-link:hover {
          background: #7f1d1d;
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
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          font-family: inherit;
          cursor: pointer;
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
          flex-shrink: 0;
        }
        
        .sidebar.collapsed .nav-icon {
          margin-right: 0;
        }
        
        .nav-text {
          flex: 1;
          font-size: 15px;
          font-weight: 500;
          white-space: nowrap;
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
        
        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 280px;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
          background: #f8f9fa;
        }
        
        .main-content.collapsed {
          margin-left: 70px;
        }
        
        .main-content.mobile {
          margin-left: 0;
          margin-top: 60px;
        }
        
        .main-content.full-width {
          margin-left: 0;
        }
        
        .main-content.with-top-header {
          margin-top: 70px;
        }
        
        /* Scrollbar Styling */
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }
        
        .sidebar-nav::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }
          
          .top-header-bar {
            display: none;
          }
          
          .main-content.collapsed {
            margin-left: 0;
          }
          
          .main-content.with-top-header {
            margin-top: 60px;
          }
          
          .user-greet {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-header {
            padding: 12px 16px;
          }
          
          .mobile-brand {
            font-size: 16px;
          }
          
          .mobile-logout-btn .logout-text {
            display: none;
          }
          
          .mobile-logout-btn {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  )
}