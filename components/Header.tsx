'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchType, setSearchType] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginForm, setLoginForm] = useState({
    mobile: '',
    password: ''
  });
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    mobile: '',
    pinCode: '',
    city: '',
    village: '',
    block: '',
    state: '',
    password: '',
    confirmPassword: ''
  });
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

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
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

  // REAL LOGIN API CALL - FIXED FOR CORRECT API RESPONSE
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    console.log('🔐 Starting login process...', {
      mobile: loginForm.mobile,
      password: loginForm.password
    });

    try {
      // URLSearchParams use karo form data ke liye
      const formData = new URLSearchParams();
      formData.append('mobile', loginForm.mobile);
      formData.append('password', loginForm.password);

      console.log('📤 Sending login request to:', LOGIN_ENDPOINT);

      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      console.log('📥 Login response status:', response.status);
      console.log('📥 Login response ok:', response.ok);

      const data = await response.json();
      console.log('📥 Login response data:', data);

      // ✅ FIXED: Check for correct API response format
      if (response.ok && data.status === 'success') {
        console.log('✅ LOGIN SUCCESSFUL - Closing modal and dispatching event');
        
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
        
        // ✅ CLOSE LOGIN MODAL
        console.log('🔒 Setting showLoginModal to false');
        setShowLoginModal(false);
        setLoginForm({ mobile: '', password: '' });
        
        // ✅ DISPATCH EVENT AFTER MODAL CLOSE
        setTimeout(() => {
          console.log('🎯 Dispatching userLoggedIn event');
          window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { 
              user: data,
              timestamp: new Date().toISOString()
            }
          }));
        }, 100);
        
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

  // ✅ ADDED: REGISTRATION API CALL
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      // Validation
      if (registerForm.password !== registerForm.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      // Check if all required fields are filled
      const requiredFields = ['fullName', 'mobile', 'pinCode', 'city', 'village', 'block', 'state', 'password'];
      const emptyFields = requiredFields.filter(field => !registerForm[field as keyof typeof registerForm]);
      
      if (emptyFields.length > 0) {
        alert('Please fill all required fields');
        return;
      }

      console.log('📤 Sending registration request...');

      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: registerForm.fullName,
          mobile: registerForm.mobile,
          pinCode: registerForm.pinCode,
          city: registerForm.city,
          village: registerForm.village,
          block: registerForm.block,
          state: registerForm.state,
          password: registerForm.password
        })
      });

      const data = await response.json();
      console.log('📥 Registration response:', data);

      if (response.ok && data.status === 'success') {
        // Store token and user data
        localStorage.setItem('authToken', data.token || data.id);
        localStorage.setItem('userData', JSON.stringify({
          id: data.id,
          fullName: registerForm.fullName,
          mobile: registerForm.mobile,
          city: registerForm.city,
          village: registerForm.village,
          ...data
        }));
        
        setIsLoggedIn(true);
        setUser({
          id: data.id,
          fullName: registerForm.fullName,
          mobile: registerForm.mobile,
          city: registerForm.city,
          village: registerForm.village,
          ...data
        });
        
        // Close register modal
        setShowRegisterModal(false);
        setRegisterForm({ 
          fullName: '', 
          mobile: '', 
          pinCode: '', 
          city: '', 
          village: '', 
          block: '', 
          state: '', 
          password: '', 
          confirmPassword: '' 
        });

        // Dispatch event after registration
        setTimeout(() => {
          console.log('🎯 Dispatching userLoggedIn event after registration');
          window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { 
              user: {
                id: data.id,
                fullName: registerForm.fullName,
                mobile: registerForm.mobile,
                city: registerForm.city,
                village: registerForm.village,
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

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
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
      document.body.style.overflow = 'hidden';
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

        {/* Login Modal */}
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
              padding: '20px'
            }}
          >
            <div 
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '30px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="modal-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ margin: 0, color: '#333' }}>Login with Publicin</h2>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleLogin}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={loginForm.mobile}
                    onChange={handleLoginInputChange}
                    placeholder="Enter your mobile number"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginInputChange}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                    opacity: isLoggingIn ? 0.7 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ color: '#666', margin: 0 }}>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowRegisterModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3498db',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ ADDED: Register Modal */}
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
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: isMobile ? '10px' : '20px'
            }}
          >
            <div 
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '15px',
                width: '100%',
                maxWidth: isMobile ? '100%' : '900px',
                height: isMobile ? '100vh' : '95vh',
                maxHeight: isMobile ? '100vh' : '95vh',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                overflow: 'hidden'
              }}
            >
              {/* Left Side - Benefits Section - Hidden in Mobile */}
              {!isMobile && (
                <div style={{
                  flex: '1',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  overflowY: 'auto'
                }}>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '600', 
                    marginBottom: '20px',
                    color: 'white'
                  }}>
                    Join Our Community
                  </h3>
                  
                  <p style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.6', 
                    marginBottom: '30px',
                    opacity: 0.9
                  }}>
                    Create your account and start exploring local businesses. Get access to exclusive features and personalized recommendations.
                  </p>

                  <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    <div style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      borderRadius: '50%', 
                      width: '50px', 
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="pe-7s-map-2" style={{ fontSize: '24px', color: 'white' }}></i>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: 'white' }}>
                        Discover Local Businesses
                      </h4>
                      <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, opacity: 0.9 }}>
                        Find and connect with the best service providers in your area.
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    <div style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      borderRadius: '50%', 
                      width: '50px', 
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="pe-7s-star" style={{ fontSize: '24px', color: 'white' }}></i>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: 'white' }}>
                        Rate & Review
                      </h4>
                      <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, opacity: 0.9 }}>
                        Share your experiences and help others make better choices.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    <div style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      borderRadius: '50%', 
                      width: '50px', 
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="pe-7s-share" style={{ fontSize: '24px', color: 'white' }}></i>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: 'white' }}>
                        Share with Friends
                      </h4>
                      <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, opacity: 0.9 }}>
                        Recommend great businesses to your friends and family.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Side - Registration Form */}
              <div style={{
                flex: '1',
                padding: isMobile ? '25px' : '40px',
                background: 'white',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px'
                }}>
                  <h2 style={{ 
                    margin: 0, 
                    color: '#333', 
                    fontSize: isMobile ? '24px' : '28px', 
                    fontWeight: '700' 
                  }}>
                    Create Account
                  </h2>
                  <button 
                    onClick={() => setShowRegisterModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: isMobile ? '24px' : '28px',
                      cursor: 'pointer',
                      color: '#666',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '14px'
                      }}>
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        style={{
                          width: '100%',
                          padding: '15px',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          background: '#f8f9fa'
                        }}
                        placeholder="Enter your full name"
                        name="fullName"
                        value={registerForm.fullName}
                        onChange={handleRegisterInputChange}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '14px'
                      }}>
                        Mobile Number *
                      </label>
                      <input 
                        type="tel" 
                        style={{
                          width: '100%',
                          padding: '15px',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          background: '#f8f9fa'
                        }}
                        placeholder="Enter your mobile number"
                        name="mobile"
                        value={registerForm.mobile}
                        onChange={handleRegisterInputChange}
                        required
                      />
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      marginBottom: '20px',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#333',
                          fontSize: '14px'
                        }}>
                          Pin Code *
                        </label>
                        <input 
                          type="text" 
                          style={{
                            width: '100%',
                            padding: '15px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            background: '#f8f9fa'
                          }}
                          placeholder="Enter pin code"
                          name="pinCode"
                          value={registerForm.pinCode}
                          onChange={handleRegisterInputChange}
                          required
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#333',
                          fontSize: '14px'
                        }}>
                          City *
                        </label>
                        <input 
                          type="text" 
                          style={{
                            width: '100%',
                            padding: '15px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            background: '#f8f9fa'
                          }}
                          placeholder="Enter city"
                          name="city"
                          value={registerForm.city}
                          onChange={handleRegisterInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      marginBottom: '20px',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#333',
                          fontSize: '14px'
                        }}>
                          Village *
                        </label>
                        <input 
                          type="text" 
                          style={{
                            width: '100%',
                            padding: '15px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            background: '#f8f9fa'
                          }}
                          placeholder="Enter village"
                          name="village"
                          value={registerForm.village}
                          onChange={handleRegisterInputChange}
                          required
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#333',
                          fontSize: '14px'
                        }}>
                          Block *
                        </label>
                        <input 
                          type="text" 
                          style={{
                            width: '100%',
                            padding: '15px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            background: '#f8f9fa'
                          }}
                          placeholder="Enter block"
                          name="block"
                          value={registerForm.block}
                          onChange={handleRegisterInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '14px'
                      }}>
                        State *
                      </label>
                      <input 
                        type="text" 
                        style={{
                          width: '100%',
                          padding: '15px',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          background: '#f8f9fa'
                        }}
                        placeholder="Enter state"
                        name="state"
                        value={registerForm.state}
                        onChange={handleRegisterInputChange}
                        required
                      />
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      marginBottom: '30px',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#333',
                          fontSize: '14px'
                        }}>
                          Password *
                        </label>
                        <input 
                          type="password" 
                          style={{
                            width: '100%',
                            padding: '15px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            background: '#f8f9fa'
                          }}
                          placeholder="Enter password"
                          name="password"
                          value={registerForm.password}
                          onChange={handleRegisterInputChange}
                          required
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#333',
                          fontSize: '14px'
                        }}>
                          Confirm Password *
                        </label>
                        <input 
                          type="password" 
                          style={{
                            width: '100%',
                            padding: '15px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            background: '#f8f9fa'
                          }}
                          placeholder="Confirm password"
                          name="confirmPassword"
                          value={registerForm.confirmPassword}
                          onChange={handleRegisterInputChange}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isRegistering}
                      style={{
                        width: '100%',
                        padding: '18px',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: isRegistering ? 'not-allowed' : 'pointer',
                        opacity: isRegistering ? 0.7 : 1,
                        transition: 'all 0.3s ease',
                        marginBottom: '20px'
                      }}
                    >
                      {isRegistering ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#666', margin: 0, fontSize: '16px' }}>
                      Already have an account?{' '}
                      <button 
                        onClick={() => {
                          setShowRegisterModal(false);
                          setShowLoginModal(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3498db',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}
                      >
                        Login here
                      </button>
                    </p>
                  </div>
                </div>
              </div>
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
        
        {/* ✅ FIXED: Mobile Menu - Proper Content Display */}
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

            {/* ✅ FIXED: User Section - Properly Shows Content */}
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
    </div>
  );
};

export default Header;