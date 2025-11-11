'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AwesomeLogin from './AwesomeLogin';
import AwesomeSignup from './AwesomeSignup';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchType, setSearchType] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // API endpoints
  const API_BASE_URL = 'https://allupipay.in/publicsewa/api';
  const LOGIN_ENDPOINT = `${API_BASE_URL}/login.php`;

  // Check screen size function
  const checkScreenSize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  // Check auth status function
  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  // Event listeners for modal coordination
  useEffect(() => {
    const handleOpenLoginModal = () => {
      console.log('✅ Login modal requested from ReviewModal - Opening login modal');
      setShowLoginModal(true);
    };

    const handleOpenLoginModalFromReview = () => {
      console.log('✅ Login modal requested from Review Section - Opening login modal');
      setShowLoginModal(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    window.addEventListener('openLoginModalFromReview', handleOpenLoginModalFromReview);

    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
      window.removeEventListener('openLoginModalFromReview', handleOpenLoginModalFromReview);
    };
  }, []);

  // Check screen size and auth status
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check screen size
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        // Check if user is logged in
        checkAuthStatus();

        // Small delay to ensure everything is loaded properly
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // ✅ UPDATED: Awesome Login Handler - Mobile number field use karo
  const handleLoginSuccess  = async (loginData: any) => {
    setIsLoggingIn(true);
    console.log('🔐 Awesome Login data:', loginData);

    try {
      // Mobile number directly use karo (ab mobile field hai)
      const mobileNumber = loginData.mobile;

      const formData = new URLSearchParams();
      formData.append('mobile', mobileNumber);
      formData.append('password', loginData.password);

      console.log('📤 Sending login request to:', LOGIN_ENDPOINT);

      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      console.log('📥 Login response status:', response.status);
      const data = await response.json();
      console.log('📥 Login response data:', data);

 if (response.ok && data.status === 'success') {
  console.log('✅ LOGIN SUCCESSFUL');

  // Store token and user data
  localStorage.setItem('authToken', data.token || data.id);
  localStorage.setItem('userData', JSON.stringify({
    id: data.id,
    fullName: data.fullName || data.name || 'User',
    mobile: data.mobile,
    city: data.city,
    village: data.village,
    ...data
  }));

  setIsLoggedIn(true);
  setUser(data);
  setShowLoginModal(false);

  // ✅ IMPROVED EVENT with user data
  setTimeout(() => {
    console.log('🎯 Dispatching userLoggedIn event with data');
    
    // Multiple events for better reliability
    window.dispatchEvent(new CustomEvent('userLoggedIn', {
      detail: {
        user: data,
        userId: data.id,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Force storage event
    window.dispatchEvent(new Event('storage'));
    
  }, 200);

  alert('Login successful!');
} else {
        console.log('❌ LOGIN FAILED:', data.message);
        alert(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      alert('Login failed. Please check your connection and try again.');
    } finally {
      console.log('🏁 Login process finished');
      setIsLoggingIn(false);
    }
  };

  // ✅ UPDATED: Awesome Signup Handler - Mobile number field use karo
  const handleAwesomeSignup = async (signupData: any) => {
    setIsRegistering(true);
    console.log('📝 Awesome Signup data:', signupData);

    try {
      // Mobile number directly use karo (ab mobile field hai)
      const mobileNumber = signupData.mobile;

      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: `${signupData.firstName} ${signupData.lastName}`,
          mobile: mobileNumber,
          pinCode: signupData.pinCode || '000000',
          city: signupData.city || 'Unknown',
          village: signupData.village || 'Unknown',
          block: signupData.block || 'Unknown',
          state: signupData.state || 'Unknown',
          password: signupData.password
        })
      });

      const data = await response.json();
      console.log('📥 Registration response:', data);

      if (response.ok && data.status === 'success') {
        // Store token and user data
        localStorage.setItem('authToken', data.token || data.id);
        localStorage.setItem('userData', JSON.stringify({
          id: data.id,
          fullName: `${signupData.firstName} ${signupData.lastName}`,
          mobile: mobileNumber,
          city: signupData.city,
          village: signupData.village,
          ...data
        }));

        setIsLoggedIn(true);
        setUser({
          id: data.id,
          fullName: `${signupData.firstName} ${signupData.lastName}`,
          mobile: mobileNumber,
          city: signupData.city,
          village: signupData.village,
          ...data
        });

        setShowRegisterModal(false);

        // Dispatch event after registration
        setTimeout(() => {
          console.log('🎯 Dispatching userLoggedIn event after registration');
          window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: {
              user: {
                id: data.id,
                fullName: `${signupData.firstName} ${signupData.lastName}`,
                mobile: mobileNumber,
                city: signupData.city,
                village: signupData.village,
                ...data
              }
            }
          }));
        }, 100);

        alert('Registration successful!');
      } else {
        alert(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please check your connection and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUser(null);

    // Dispatch event when user logs out
    window.dispatchEvent(new CustomEvent('userLoggedOut'));

    // Close mobile menu if open
    closeMenu();

    alert('Logged out successfully!');
  };

  // ESC key press par menu close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        closeMenu();
        setShowLoginModal(false);
        setShowRegisterModal(false);
      }
    };

    if (isMenuOpen || showLoginModal || showRegisterModal) {
      document.addEventListener('keydown', handleEscKey);
      if (showLoginModal || showRegisterModal) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, showLoginModal, showRegisterModal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted:', searchType);
  };

  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
  };

  // ✅ ADDED: Forgot Password Handler for AwesomeLogin
  const handleForgotPassword = () => {
    alert('Password reset feature coming soon!');
  };

  return (
    <div id="page" className={isMenuOpen ? 'menu-open' : ''}>
      {/* Header Section */}
      <header className="header_sticky">
        {/* Mobile Menu Button */}
        <button
          className="btn_mobile"
          onClick={toggleMenu}
          type="button"
          aria-label="Toggle menu"
          style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1001
          }}
        >
          <div className={`hamburger hamburger--spin ${isMenuOpen ? 'is-active' : ''}`}>
            <div className="hamburger-box">
              <div className="hamburger-inner"></div>
            </div>
          </div>
        </button>

        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-6">
              <div id="logo_home">
                <h1>
                  <Link href="/" title="Findoctor" style={{
                    fontSize: isMobile ? '20px' : '24px',
                    textDecoration: 'none',
                    color: '#333'
                  }}>
                    Findoctor
                  </Link>
                </h1>
              </div>
            </div>

            {/* Desktop - Show Login/Signup only when not loading */}
            {!isMobile && !isLoading && (
              <div className="col-lg-9 col-6">
                {/* Centered User Access Section with Larger Icons */}
                <ul id="top_access" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '20px',
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  height: '100%'
                }}>
                  {isLoggedIn ? (
                    <>
                      <li className="user-welcome">
                        <span style={{
                          color: '#333',
                          fontSize: '16px',
                          fontWeight: '500'
                        }}>
                          Welcome, {user?.fullName}
                        </span>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#e74c3c';
                            e.currentTarget.style.backgroundColor = '#fdf2f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#666';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Logout"
                        >
                          <i className="pe-7s-power" style={{ fontSize: '28px' }}></i>
                          <span style={{ fontSize: '12px', fontWeight: '500' }}>Logout</span>
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <button
                          onClick={() => setShowLoginModal(true)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#3498db';
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#666';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Login"
                        >
                          <i className="pe-7s-user" style={{ fontSize: '28px' }}></i>
                          <span style={{ fontSize: '12px', fontWeight: '500' }}>Login</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => setShowRegisterModal(true)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#27ae60';
                            e.currentTarget.style.backgroundColor = '#f0fff4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#666';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Sign Up"
                        >
                          <i className="pe-7s-add-user" style={{ fontSize: '28px' }}></i>
                          <span style={{ fontSize: '12px', fontWeight: '500' }}>Sign Up</span>
                        </button>
                      </li>
                    </>
                  )}
                </ul>

                {/* Simplified Desktop Menu - Centered */}
                <nav id="menu" className="main-menu desktop-menu" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <ul style={{
                    display: 'flex',
                    gap: '30px',
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    alignItems: 'center'
                  }}>
                    <li>
                      <Link href="/" style={{
                        textDecoration: 'none',
                        color: '#333',
                        fontWeight: '500',
                        fontSize: '16px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        transition: 'all 0.3s ease'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#3498db';
                          e.currentTarget.style.backgroundColor = '#f0f8ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#333';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}>
                        🏠 Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/list-your-business"
                        style={{
                          color: '#27ae60',
                          fontWeight: 'bold',
                          background: '#f0fff4',
                          padding: '12px 24px',
                          borderRadius: '25px',
                          border: '2px solid #27ae60',
                          textDecoration: 'none',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#27ae60';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f0fff4';
                          e.currentTarget.style.color = '#27ae60';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        📍 List Your Business FREE
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            )}

            {/* Loading State - Show simple placeholder while loading */}
            {!isMobile && isLoading && (
              <div className="col-lg-9 col-6">
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <div style={{
                    width: '100px',
                    height: '20px',
                    background: '#f0f0f0',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ UPDATED: Awesome Login Modal with Scroll Fix */}
        {showLoginModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowLoginModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              padding: '20px',
              backdropFilter: 'blur(5px)',
              overflow: 'auto' // ✅ Scroll enable for overlay
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '450px',
                margin: 'auto' // ✅ Center the modal
              }}
            >
              <AwesomeLogin
                onLogin={handleLoginSuccess }
                onSwitchToSignup={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                }}
                onForgotPassword={handleForgotPassword}
                loading={isLoggingIn}
                className="awesome-auth-modal"
                showSocialLogin={false}
              />
            </div>
          </div>
        )}

        {/* ✅ UPDATED: Awesome Signup Modal with Scroll Fix */}
        {showRegisterModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowRegisterModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'flex-start', // ✅ Changed to flex-start for scroll
              justifyContent: 'center',
              zIndex: 10001,
              padding: '20px',
              backdropFilter: 'blur(5px)',
              overflow: 'auto' // ✅ Scroll enable for overlay
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '500px',
                margin: '20px auto' // ✅ Margin for better spacing
              }}
            >
              <AwesomeSignup
                onSignup={handleAwesomeSignup}
                onSwitchToLogin={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                }}
                loading={isRegistering}
                className="awesome-auth-modal"
                showSocialSignup={false}
                showAdditionalFields={true}
              />
            </div>
          </div>
        )}

        {/* Mobile Menu Backdrop */}
        <div
          className={`mobile-menu-backdrop ${isMenuOpen ? 'active' : ''}`}
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            opacity: isMenuOpen ? 1 : 0,
            visibility: isMenuOpen ? 'visible' : 'hidden',
            transition: 'all 0.3s ease-in-out'
          }}
        ></div>

        {/* ✅ UPDATED: Mobile Menu with Awesome Modal Integration */}
        <nav
          className={`mobile-menu ${isMenuOpen ? 'mobile-open' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            left: isMenuOpen ? 0 : '-320px',
            width: '320px',
            height: '100%',
            backgroundColor: 'white',
            zIndex: 1000,
            overflowY: 'auto',
            transition: 'left 0.3s ease-in-out',
            boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ padding: '20px' }}>
            {/* Mobile Menu Header */}
            <div style={{
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid #eee'
            }}>
              <h3 style={{ margin: 0, color: '#333', textAlign: 'center' }}>Menu</h3>
            </div>

            {/* Navigation Links */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <Link
                  href="/"
                  onClick={closeMenu}
                  style={{
                    display: 'block',
                    padding: '12px 15px',
                    color: '#333',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f8ff';
                    e.currentTarget.style.color = '#3498db';
                  }}
                >
                  🏠 Home
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link
                  href="/list-your-business"
                  onClick={closeMenu}
                  style={{
                    display: 'block',
                    padding: '12px 15px',
                    color: '#27ae60',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    border: '1px solid #27ae60',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#27ae60';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  📍 List Your Business FREE
                </Link>
              </li>
            </ul>

            {/* ✅ UPDATED: User Section with Awesome Modal Integration */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              {isLoggedIn ? (
                <div style={{ textAlign: 'center' }}>
                  {/* User Welcome Message */}
                  <div style={{
                    padding: '15px',
                    background: '#f0f8ff',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <p style={{ margin: '0 0 5px 0', color: '#333', fontWeight: '500' }}>
                      Welcome,
                    </p>
                    <p style={{ margin: 0, color: '#3498db', fontWeight: 'bold', fontSize: '16px' }}>
                      {user?.fullName || 'User'}
                    </p>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>
                      {user?.mobile}
                    </p>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="pe-7s-power" style={{ fontSize: '16px' }}></i>
                    Logout
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      closeMenu();
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="pe-7s-user" style={{ fontSize: '16px' }}></i>
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowRegisterModal(true);
                      closeMenu();
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="pe-7s-add-user" style={{ fontSize: '16px' }}></i>
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Search Section */}
        <div className="hero_home version_1">
          <div className="content">
            <h3 className="fadeInUp animated">Discover Your Local Business</h3>
            <p className="fadeInUp animated">
              🔍 Search by Category, Location, or Name<br />
              📍 List and Manage Your Business Online<br />
              🌟 Reach More People, Get More Leads
            </p>

            <form onSubmit={handleSearchSubmit}>
              <div id="custom-search-input">
                <div className="input-group">
                  <input
                    type="text"
                    className="search-query"
                    placeholder="Ex. Name, Specialization ...."
                    style={{ color: 'white' }}
                  />
                  <input
                    type="submit"
                    className="btn_search"
                    value="Search"
                  />
                </div>

                <ul>
                  <li>
                    <input
                      type="radio"
                      id="all"
                      name="radio_search"
                      value="all"
                      checked={searchType === 'all'}
                      onChange={() => handleSearchTypeChange('all')}
                    />
                    <label htmlFor="all" style={{ color: 'white' }}>All</label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id="doctor"
                      name="radio_search"
                      value="doctor"
                      checked={searchType === 'doctor'}
                      onChange={() => handleSearchTypeChange('doctor')}
                    />
                    <label htmlFor="doctor" style={{ color: 'white' }}>Doctor</label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id="clinic"
                      name="radio_search"
                      value="clinic"
                      checked={searchType === 'clinic'}
                      onChange={() => handleSearchTypeChange('clinic')}
                    />
                    <label htmlFor="clinic" style={{ color: 'white' }}>Clinic</label>
                  </li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ✅ UPDATED: Custom CSS for Awesome Components */}
      <style jsx>{`
        .awesome-auth-modal {
          animation: scaleUp 0.3s ease forwards;
        }
        
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Mobile responsiveness for awesome modals */
        @media (max-width: 768px) {
          .awesome-auth-modal {
            margin: 10px;
          }
          
          .modal-overlay {
            padding: 10px !important;
          }
        }

        /* Ensure proper scrolling */
        .modal-overlay {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default Header;