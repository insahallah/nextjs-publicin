// components/LayoutWithSidebar.tsx - Sidebar updated
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
  const [isPulsing, setIsPulsing] = useState(true)

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

  // Pulse animation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(prev => !prev)
    }, 2000)
    
    return () => clearInterval(interval)
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
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsLoggedIn(false)
      setUser(null)
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

  // Add Business function with animation
  const goToAddBusiness = () => {
    // Add click animation effect
    const button = document.querySelector('.add-business-btn')
    if (button) {
      button.classList.add('clicked')
      setTimeout(() => {
        button.classList.remove('clicked')
      }, 300)
    }
    
    // Navigate after animation
    setTimeout(() => {
      router.push('/list-your-business')
    }, 150)
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
    
    router.push('/list-your-business')
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

  // Show loading or redirect - no login prompt
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      )
    }

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

            {/* 🔥 SUPER STYLISH ADD BUSINESS BUTTON - CENTER ME */}
            <div className="header-center">
              <div className="add-business-container">
                <button 
                  onClick={goToAddBusiness}
                  className={`add-business-btn ${isPulsing ? 'pulse' : ''}`}
                  title="Add Your Business Free - Limited Time Offer!"
                >
                  {/* Animated Background Elements */}
                  <div className="sparkle-container">
                    <div className="sparkle s1">✨</div>
                    <div className="sparkle s2">✨</div>
                    <div className="sparkle s3">✨</div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="add-business-content">
                    <div className="icon-wrapper">
                      <span className="add-business-icon">🚀</span>
                      <div className="icon-glow"></div>
                    </div>
                    <div className="text-content">
                      <span className="add-business-text">
                        Add your Business <span className="free-text">FREE</span>
                      </span>
                      <span className="offer-text">Limited Time Offer!</span>
                    </div>
                    <div className="arrow-wrapper">
                      <span className="arrow-icon">🎯</span>
                    </div>
                  </div>

                  {/* Floating Particles */}
                  <div className="floating-particles">
                    <div className="particle p1">⭐</div>
                    <div className="particle p2">🔥</div>
                    <div className="particle p3">💫</div>
                    <div className="particle p4">🌟</div>
                  </div>
                </button>
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
                  <span className="user-name dark-user-name">{user.fullName}</span>
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

                      {/* 🔥 ADD BUSINESS IN DROPDOWN */}
                      <button 
                        onClick={goToAddBusiness}
                        className="dropdown-link add-business-dropdown-link"
                      >
                        <span className="link-icon">🚀</span>
                        Add Business FREE
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

      {/* 🔥 MOBILE HEADER - PUBLICIN REMOVED, FULL LIST YOUR BUSINESS */}
      {isMobile && isLoggedIn && (
        <div className="mobile-header">
          <button 
            className="menu-toggle-btn"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          
          {/* 🔥 PUBLICIN REMOVED - FULL LIST YOUR BUSINESS BUTTON */}
          <div className="mobile-business-container">
            <button 
              onClick={goToAddBusiness}
              className="mobile-add-business-btn-full"
              title="List Your Business FREE"
            >
              <div className="mobile-business-content">
                <span className="mobile-business-icon">🚀</span>
                <div className="mobile-business-text">
                  <span className="mobile-main-text">List Your Business</span>
                  <span className="mobile-free-text">FREE</span>
                </div>
              </div>
              <div className="mobile-business-glow"></div>
            </button>
          </div>
          
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
                {/* 🔥 DESKTOP KE LIYE PUBLICIN RAKHA HAI */}
                <h3 className="brand">{!isMobile ? "🏠 PUBLICIN" : "🏠 Dashboard"}</h3>
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
                {/* 🔥 USER NAME BLACK COLOR KAR DIYA */}
                <div className="user-name black-user-name">{user.fullName}</div>
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

              {/* 🔥 DASHBOARD REMOVE KAR DIYA */}

              {/* 🔥 SUPER STYLISH ADD BUSINESS IN SIDEBAR - TOP ME */}
              <li className="nav-item highlight-item">
                <button 
                  onClick={() => {
                    goToAddBusiness();
                    closeMobileSidebar();
                  }}
                  className="nav-link add-business-nav-link"
                >
                  <span className="nav-icon">🚀</span>
                  {(!sidebarCollapsed || isMobile) && (
                    <div className="sidebar-business-content">
                      <span className="nav-text">List Your Business</span>
                      <div className="sidebar-badge-container">
                        <span className="nav-badge free-badge">FREE</span>
                        <span className="hot-badge">HOT</span>
                      </div>
                    </div>
                  )}
                </button>
              </li>

              {/* 🔥 MY BUSINESSES KO TOP ME KAR DIYA */}
              <li className="nav-item">
                <a href="/my-businesses" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">🏢</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">My Businesses</span>}
                </a>
              </li>

              {/* 🔥 MESSAGES REMOVE KAR DIYA */}

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

              {/* 🔥 BOOKMARKS REMOVE KAR DIYA */}

              <li className="nav-divider"></li>

              <li className="nav-item">
                <a href="/profile" className="nav-link" onClick={closeMobileSidebar}>
                  <span className="nav-icon">👤</span>
                  {(!sidebarCollapsed || isMobile) && <span className="nav-text">My Profile</span>}
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

      {/* 🔥 COMPLETE CSS STYLES WITH SIDEBAR UPDATES */}
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

        /* 🔥 SUPER STYLISH ADD BUSINESS BUTTON */
        .header-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .add-business-container {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .add-business-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, 
            #ff6b6b 0%, 
            #ff8e8e 25%, 
            #ffd93d 50%, 
            #6bcf7f 75%, 
            #4d96ff 100%);
          background-size: 400% 400%;
          border: none;
          border-radius: 20px;
          padding: 14px 28px;
          cursor: pointer;
          transition: all 0.5s ease;
          color: white;
          font-weight: 800;
          font-size: 16px;
          box-shadow: 
            0 8px 32px rgba(255, 107, 107, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
          animation: gradientShift 3s ease infinite, float 6s ease-in-out infinite;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          min-width: 280px;
        }

        /* Gradient Animation */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }

        /* Pulse Animation */
        .add-business-btn.pulse {
          animation: gradientShift 3s ease infinite, 
                    float 6s ease-in-out infinite,
                    pulseGlow 2s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: 
              0 8px 32px rgba(255, 107, 107, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }
          50% { 
            box-shadow: 
              0 12px 48px rgba(255, 107, 107, 0.7),
              0 0 0 2px rgba(255, 255, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.4);
          }
        }

        /* Click Animation */
        .add-business-btn.clicked {
          transform: scale(0.95);
          animation: clickPop 0.3s ease;
        }

        @keyframes clickPop {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        .add-business-btn:hover {
          animation: gradientShift 1.5s ease infinite, 
                    float 3s ease-in-out infinite;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 
            0 16px 48px rgba(255, 107, 107, 0.6),
            0 0 0 2px rgba(255, 255, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .add-business-content {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-business-icon {
          font-size: 24px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          animation: rocketBounce 2s ease-in-out infinite;
        }

        @keyframes rocketBounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }

        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
        }

        .text-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .add-business-text {
          font-weight: 800;
          font-size: 16px;
          white-space: nowrap;
          letter-spacing: 0.5px;
        }

        .free-text {
          background: linear-gradient(45deg, #fff, #ffeb3b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 900;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          animation: textShine 2s ease-in-out infinite;
        }

        @keyframes textShine {
          0%, 100% { filter: brightness(1) contrast(1); }
          50% { filter: brightness(1.2) contrast(1.1); }
        }

        .offer-text {
          font-size: 10px;
          font-weight: 700;
          opacity: 0.9;
          letter-spacing: 1px;
          text-transform: uppercase;
          animation: offerBlink 3s ease-in-out infinite;
        }

        @keyframes offerBlink {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.6; }
        }

        .arrow-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arrow-icon {
          font-size: 18px;
          animation: targetSpin 3s ease-in-out infinite;
        }

        @keyframes targetSpin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
        }

        /* Sparkle Animations */
        .sparkle-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .sparkle {
          position: absolute;
          font-size: 12px;
          opacity: 0;
          animation: sparkleFloat 4s ease-in-out infinite;
        }

        .sparkle.s1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .sparkle.s2 {
          top: 60%;
          right: 15%;
          animation-delay: 1.3s;
        }

        .sparkle.s3 {
          bottom: 30%;
          left: 20%;
          animation-delay: 2.6s;
        }

        @keyframes sparkleFloat {
          0%, 100% { 
            opacity: 0; 
            transform: translateY(0px) rotate(0deg) scale(0.5);
          }
          50% { 
            opacity: 1; 
            transform: translateY(-20px) rotate(180deg) scale(1.2);
          }
        }

        /* Floating Particles */
        .floating-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          font-size: 8px;
          opacity: 0;
          animation: particleFloat 6s ease-in-out infinite;
        }

        .particle.p1 {
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .particle.p2 {
          top: 80%;
          right: 5%;
          animation-delay: 2s;
        }

        .particle.p3 {
          bottom: 10%;
          left: 30%;
          animation-delay: 4s;
        }

        .particle.p4 {
          top: 40%;
          right: 25%;
          animation-delay: 1s;
        }

        @keyframes particleFloat {
          0%, 100% { 
            opacity: 0; 
            transform: translateY(0px) rotate(0deg) scale(0.3);
          }
          25% { 
            opacity: 0.7; 
            transform: translateY(-15px) rotate(90deg) scale(0.8);
          }
          50% { 
            opacity: 1; 
            transform: translateY(-30px) rotate(180deg) scale(1);
          }
          75% { 
            opacity: 0.7; 
            transform: translateY(-45px) rotate(270deg) scale(0.8);
          }
        }
        
        .header-right {
          display: flex;
          align-items: center;
          flex: 1;
          justify-content: flex-end;
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
        
        /* 🔥 FIXED: User name dark color */
        .user-name, .dark-user-name {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b !important;
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

        /* 🔥 ADD BUSINESS IN DROPDOWN HIGHLIGHT */
        .add-business-dropdown-link {
          background: linear-gradient(135deg, #ff6b6b15, #4d96ff15);
          border-left: 3px solid #ff6b6b;
          color: #e74c3c;
          font-weight: 700;
        }

        .add-business-dropdown-link:hover {
          background: linear-gradient(135deg, #ff6b6b25, #4d96ff25);
          color: #c0392b;
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
        
        /* 🔥 MOBILE HEADER - PUBLICIN REMOVED, FULL LIST YOUR BUSINESS */
        .mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
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
          margin-right: 12px;
          border-radius: 6px;
          transition: background 0.2s;
          color: #374151;
          flex-shrink: 0;
        }
        
        .menu-toggle-btn:hover {
          background: #f1f5f9;
        }

        /* 🔥 MOBILE BUSINESS CONTAINER - FULL WIDTH */
        .mobile-business-container {
          flex: 1;
          display: flex;
          justify-content: center;
          margin: 0 12px;
        }

        .mobile-add-business-btn-full {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, 
            #ff6b6b 0%, 
            #ff8e8e 25%, 
            #ffd93d 50%, 
            #6bcf7f 75%, 
            #4d96ff 100%);
          background-size: 300% 300%;
          border: none;
          border-radius: 16px;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.5s ease;
          color: white;
          font-weight: 700;
          box-shadow: 
            0 6px 20px rgba(255, 107, 107, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          animation: mobileGradientShift 4s ease infinite;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 220px;
          min-height: 44px;
        }

        @keyframes mobileGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .mobile-add-business-btn-full:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 25px rgba(255, 107, 107, 0.6),
            0 0 0 2px rgba(255, 255, 255, 0.2);
        }

        .mobile-business-content {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 2;
        }

        .mobile-business-icon {
          font-size: 18px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
          animation: mobileRocketBounce 2s ease-in-out infinite;
        }

        @keyframes mobileRocketBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        .mobile-business-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
        }

        .mobile-main-text {
          font-weight: 700;
          font-size: 13px;
          white-space: nowrap;
          letter-spacing: 0.3px;
        }

        .mobile-free-text {
          background: linear-gradient(45deg, #fff, #ffeb3b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          font-size: 11px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          animation: mobileTextShine 2s ease-in-out infinite;
        }

        @keyframes mobileTextShine {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }

        .mobile-business-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          border-radius: 16px;
          animation: mobileGlowPulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes mobileGlowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .mobile-user-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        
        .user-info-mobile {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #475569;
        }
        
        .user-greet {
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
        }
        
        /* Mobile Logout Button */
        .mobile-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #dc2626;
          font-size: 12px;
          font-weight: 500;
          flex-shrink: 0;
        }
        
        .mobile-logout-btn:hover {
          background: #fecaca;
          border-color: #fca5a5;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
        }
        
        .logout-icon {
          width: 14px;
          height: 14px;
          color: #dc2626;
          flex-shrink: 0;
        }
        
        .logout-text {
          font-weight: 600;
          font-size: 12px;
          white-space: nowrap;
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
        
        /* 🔥 DESKTOP KE LIYE PUBLICIN, MOBILE KE LIYE DASHBOARD */
        .brand {
          margin: 0;
          font-size: 18px;
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
        
        /* 🔥 USER NAME BLACK COLOR KAR DIYA */
        .user-name, .black-user-name {
          font-weight: 600;
          color: #000000 !important; /* Black color */
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

        /* 🔥 SUPER STYLISH ADD BUSINESS IN SIDEBAR */
        .nav-item.highlight-item .nav-link {
          background: linear-gradient(135deg, #ff6b6b, #4d96ff);
          color: white;
          border-left: 4px solid #ffeb3b;
          animation: sidebarPulse 3s ease-in-out infinite;
        }

        @keyframes sidebarPulse {
          0%, 100% { 
            box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
          }
          50% { 
            box-shadow: 0 6px 24px rgba(255, 107, 107, 0.7);
          }
        }

        .nav-item.highlight-item .nav-link:hover {
          background: linear-gradient(135deg, #ff5252, #357abd);
          transform: translateX(5px);
        }

        .sidebar-business-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .sidebar-badge-container {
          display: flex;
          gap: 4px;
        }

        .hot-badge {
          background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 900;
          animation: hotBlink 2s ease-in-out infinite;
        }

        @keyframes hotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
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

        /* 🔥 FREE BADGE STYLE */
        .free-badge {
          background: linear-gradient(135deg, #ffeb3b, #ff9800) !important;
          color: #000 !important;
          font-size: 10px !important;
          padding: 3px 6px !important;
          border-radius: 8px !important;
          font-weight: 900 !important;
          animation: badgeShine 2s ease-in-out infinite;
        }

        @keyframes badgeShine {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
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

          .header-center {
            display: none;
          }

          .add-business-btn {
            min-width: 240px;
            padding: 12px 20px;
          }

          .add-business-text {
            font-size: 14px;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-header {
            padding: 10px 12px;
          }
          
          .mobile-add-business-btn-full {
            padding: 8px 12px;
            max-width: 200px;
            min-height: 40px;
          }

          .mobile-main-text {
            font-size: 12px;
          }

          .mobile-free-text {
            font-size: 10px;
          }

          .mobile-business-icon {
            font-size: 16px;
          }

          .mobile-logout-btn .logout-text {
            display: none;
          }
          
          .mobile-logout-btn {
            padding: 6px;
          }

          .user-info-mobile {
            display: none;
          }
        }

        @media (max-width: 360px) {
          .mobile-add-business-btn-full {
            max-width: 180px;
            padding: 6px 10px;
          }

          .mobile-main-text {
            font-size: 11px;
          }

          .mobile-business-icon {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}