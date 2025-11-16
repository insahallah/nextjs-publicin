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
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsLoggedIn(false)
      setUser(null)
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
    
    // Redirect to home page after logout
    setTimeout(() => {
      router.push('/')
    }, 100)
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

  // Protected content - show only when logged in
  const renderProtectedContent = () => {
    if (isLoading) {
      return (
        <div className="loading-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      )
    }

    if (!isLoggedIn) {
      return (
        <div className="login-required">
          <div className="login-prompt">
            <div className="login-icon">🔒</div>
            <h2>Login Required</h2>
            <p>Please login to access the dashboard</p>
            <button 
              className="login-btn"
              onClick={handleLoginClick}
            >
              Login Now
            </button>
            <p className="login-note">
              Don't have an account? <span onClick={handleLoginClick} className="signup-link">Sign up here</span>
            </p>
            
            {/* HOME PAGE LINK ADDED */}
            <div className="home-page-link">
              <button 
                onClick={goToHomePage}
                className="home-btn"
              >
                🏠 Go to Home Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return children
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
                {/* HOME LINK ADDED */}
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
      {isMobile && (
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
        {renderProtectedContent()}
      </div>

      {/* COMPLETE CSS STYLES */}
      /* components/LayoutWithSidebar.tsx - Complete CSS */
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
  
  /* Professional Login Required Styles */
  .login-required {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }
  
  .login-prompt {
    text-align: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 60px 50px;
    border-radius: 24px;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    max-width: 480px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.3);
    position: relative;
    overflow: hidden;
  }
  
  .login-prompt::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  }
  
  .login-icon {
    font-size: 80px;
    margin-bottom: 24px;
    display: block;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
  }
  
  .login-prompt h2 {
    margin: 0 0 16px 0;
    color: #1f2937;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    background: linear-gradient(135deg, #1f2937, #374151);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .login-prompt p {
    margin: 0 0 40px 0;
    color: #6b7280;
    font-size: 18px;
    line-height: 1.6;
    font-weight: 400;
  }
  
  .login-btn {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    padding: 18px 40px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 24px;
    width: 100%;
    max-width: 280px;
    box-shadow: 
      0 4px 14px rgba(59, 130, 246, 0.4),
      0 0 0 1px rgba(59, 130, 246, 0.1);
    position: relative;
    overflow: hidden;
  }
  
  .login-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  .login-btn:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-3px);
    box-shadow: 
      0 8px 25px rgba(59, 130, 246, 0.5),
      0 0 0 1px rgba(59, 130, 246, 0.2);
  }
  
  .login-btn:hover::before {
    left: 100%;
  }
  
  .login-btn:active {
    transform: translateY(-1px);
  }
  
  .login-note {
    font-size: 16px;
    color: #6b7280;
    margin: 32px 0 0 0 !important;
    font-weight: 400;
  }
  
  .signup-link {
    color: #3b82f6;
    cursor: pointer;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
    padding: 4px 8px;
    border-radius: 6px;
  }
  
  .signup-link:hover {
    color: #2563eb;
    background: rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }
  
  .signup-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 8px;
    right: 8px;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  .signup-link:hover::after {
    transform: scaleX(1);
  }
  
  /* Home Page Link Styles */
  .home-page-link {
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid rgba(229, 231, 235, 0.8);
    position: relative;
  }
  
  .home-page-link::before {
    content: '✦';
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 0 16px;
    color: #9ca3af;
    font-size: 14px;
  }
  
  .home-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 240px;
    box-shadow: 
      0 4px 14px rgba(16, 185, 129, 0.4),
      0 0 0 1px rgba(16, 185, 129, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 0 auto;
  }
  
  .home-btn:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-3px);
    box-shadow: 
      0 8px 25px rgba(16, 185, 129, 0.5),
      0 0 0 1px rgba(16, 185, 129, 0.2);
  }
  
  .home-btn:active {
    transform: translateY(-1px);
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
  
  /* Animation for page load */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .login-prompt {
    animation: fadeInUp 0.6s ease-out;
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
    
    .login-prompt {
      padding: 40px 24px;
      margin: 20px;
      border-radius: 20px;
    }
    
    .login-prompt h2 {
      font-size: 28px;
    }
    
    .login-prompt p {
      font-size: 16px;
    }
    
    .login-btn {
      padding: 16px 32px;
      font-size: 16px;
      max-width: 100%;
    }
    
    .home-btn {
      padding: 14px 28px;
      font-size: 15px;
      max-width: 100%;
    }
    
    .login-icon {
      font-size: 64px;
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
    
    .login-prompt {
      padding: 32px 20px;
    }
    
    .login-prompt h2 {
      font-size: 24px;
    }
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .login-prompt {
      background: rgba(17, 24, 39, 0.95);
      color: #f9fafb;
    }
    
    .login-prompt h2 {
      background: linear-gradient(135deg, #f9fafb, #e5e7eb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .login-prompt p {
      color: #d1d5db;
    }
    
    .login-note {
      color: #d1d5db;
    }
  }
`}</style>
    </div>
  )
}