'use client';
import { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';

import Link from 'next/link';
import Swal from 'sweetalert2';
import AwesomeLogin from './AwesomeLogin';
import AwesomeSignup from './AwesomeSignup';
import { API_ENDPOINTS } from '@/configs/api';
//const navigate = useNavigate();
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
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    // API endpoints
    //const API_BASE_URL = 'https://allupipay.in/publicsewa/api/users';
   const LOGIN_ENDPOINT = `${API_ENDPOINTS.AUTH.LOGIN}`;

    // helper: non-blocking toast (replaces console.log)
    const toast = (message: string, icon: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        try {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon,
                title: message,
                showConfirmButton: false,
                timer: 1500,
                background: '#ffffff',
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(message, e);
        }
    };

    // helper: modal (replaces alert)
    const modal = (opts: { icon?: 'success' | 'error' | 'info' | 'warning'; title?: string; text?: string }) => {
        Swal.fire({
            icon: opts.icon || 'info',
            title: opts.title || '',
            text: opts.text || '',
            confirmButtonColor: opts.icon === 'error' ? '#ef4444' : '#10b981',
            background: '#ffffff',
        });
    };

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

    // Handle scroll for sticky header
    const handleScroll = () => {
        if (window.scrollY > 50) {
            setIsSticky(true);
        } else {
            setIsSticky(false);
        }
    };

    // Event listeners for modal coordination
    useEffect(() => {
        const handleOpenLoginModal = () => {
            toast('Login modal requested from ReviewModal', 'info');
            setShowLoginModal(true);
        };

        const handleOpenLoginModalFromReview = () => {
            toast('Login modal requested from Review Section', 'info');
            setShowLoginModal(true);
        };

        window.addEventListener('openLoginModal', handleOpenLoginModal);
        window.addEventListener('openLoginModalFromReview', handleOpenLoginModalFromReview);

        return () => {
            window.removeEventListener('openLoginModal', handleOpenLoginModal);
            window.removeEventListener('openLoginModalFromReview', handleOpenLoginModalFromReview);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Check screen size and auth status
    useEffect(() => {
        const initializeApp = async () => {
            try {
                checkScreenSize();
                window.addEventListener('resize', checkScreenSize);
                window.addEventListener('scroll', handleScroll);
                checkAuthStatus();
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Initialization error:', error);
                modal({ icon: 'error', title: 'Initialization error', text: String(error) });
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();

        return () => {
            window.removeEventListener('resize', checkScreenSize);
            window.removeEventListener('scroll', handleScroll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showUserDropdown) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showUserDropdown]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Toggle user dropdown
    const toggleUserDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowUserDropdown(!showUserDropdown);
    };

    // Login Handler
    const handleLoginSuccess = async (loginData: any) => {
        setIsLoggingIn(true);

        try {
            const mobileNumber = loginData.mobile;

            const formData = new URLSearchParams();
            formData.append('mobile', mobileNumber);
            formData.append('password', loginData.password);

            const response = await fetch(LOGIN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                toast('Login successful!', 'success');

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
                setShowUserDropdown(false);

                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('userLoggedIn', {
                        detail: {
                            user: data,
                            userId: data.id,
                            timestamp: new Date().toISOString()
                        }
                    }));
                    window.dispatchEvent(new Event('storage'));
                }, 200);

                modal({ icon: 'success', title: 'Login successful!', text: 'Welcome back!' });
            } else {
                const errorMessage = data.message || 'Login failed. Please check your credentials and try again.';
                modal({
                    icon: 'error',
                    title: 'Login failed',
                    text: errorMessage
                });
                toast(errorMessage, 'error');
            }
        } catch (error) {
            const errorMessage = 'Network error: Please check your internet connection and try again.';
            // eslint-disable-next-line no-console
            console.error('Login error:', error);
            modal({
                icon: 'error',
                title: 'Login failed',
                text: errorMessage
            });
            toast(errorMessage, 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Signup Handler
    const handleAwesomeSignup = async (signupData: any) => {
        setIsRegistering(true);
        toast(`Signup data received: ${typeof signupData === 'object' ? (signupData.mobile || 'mobile') : String(signupData)}`, 'info');

        try {
            const mobileNumber = signupData.mobile;

            const response = await fetch(`${API_ENDPOINTS.AUTH.REGISTER}`, {
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
            toast('Registration response received', 'info');

            if (response.ok && data.status === 'success') {
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
                setShowUserDropdown(false);

                setTimeout(() => {
                    toast('Dispatching userLoggedIn event after registration', 'info');
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

                modal({ icon: 'success', title: 'Registration successful!', text: 'Welcome!' });
            } else {
                const errorMessage = data.message || 'Registration failed. Please try again.';
                modal({
                    icon: 'error',
                    title: 'Registration failed',
                    text: errorMessage
                });
                toast(errorMessage, 'error');
            }
        } catch (error) {
            const errorMessage = 'Network error: Please check your internet connection and try again.';
            // eslint-disable-next-line no-console
            console.error('Registration error:', error);
            modal({
                icon: 'error',
                title: 'Registration failed',
                text: errorMessage
            });
            toast(errorMessage, 'error');
        } finally {
            setIsRegistering(false);
        }
    };

const handleLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  setIsLoggedIn(false);
  setUser(null);
  setShowUserDropdown(false);
  window.dispatchEvent(new CustomEvent('userLoggedOut'));
  closeMenu();
  modal({ icon: 'info', title: 'Logged out successfully!', text: '' });
  
  // Redirect with query parameter
  
window.location.href = '/list-your-business';
};

    // ESC key press par menu close
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.keyCode === 27) {
                closeMenu();
                setShowLoginModal(false);
                setShowRegisterModal(false);
                setShowUserDropdown(false);
            }
        };

        if (isMenuOpen || showLoginModal || showRegisterModal || showUserDropdown) {
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
    }, [isMenuOpen, showLoginModal, showRegisterModal, showUserDropdown]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast(`Search submitted: ${searchType}`, 'info');
    };

    const handleSearchTypeChange = (type: string) => {
        setSearchType(type);
    };

    // Forgot Password Handler
    const handleForgotPassword = () => {
        modal({ icon: 'info', title: 'Password reset feature coming soon!', text: '' });
    };

    // Get App Handler
    const handleGetApp = () => {
        modal({
            icon: 'info',
            title: 'Download Our App!',
            text: 'Our mobile app is coming soon! Stay tuned for updates.'
        });
    };

    return (
        <div id="page" className={isMenuOpen ? 'menu-open' : ''}>
            {/* ✅ STICKY HEADER SECTION - HEIGHT 85px */}
            <header className={`header_sticky ${isSticky ? 'sticky-active' : ''}`} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                background: 'white',
                boxShadow: isSticky ? '0 2px 15px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.3s ease',
                zIndex: 1000,
                borderBottom: '1px solid #f0f0f0',
                height: isMobile ? '70px' : '85px'
            }}>
                <div className="container">
                    <div className="row" style={{ alignItems: 'center', minHeight: '55px' }}>
                        {/* ✅ DESKTOP LAYOUT - LOGO LEFT, ALL OTHERS RIGHT */}
                        {!isMobile ? (
                            <>
                                {/* Logo - Left Side */}
                                <div className="col-lg-3" style={{
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <div id="logo_home">
                                        <h1 style={{ margin: 0 }}>
                                            <Link href="/" title="Publicin">
                                                Publicin
                                            </Link>
                                        </h1>
                                    </div>
                                </div>

                                {/* ALL CONTENT RIGHT SIDE */}
                                <div className="col-lg-9" style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    gap: '25px'
                                }}>
                                    {/* Navigation Links */}
                                    <nav style={{
                                        display: 'flex',
                                        gap: '25px',
                                        alignItems: 'center'
                                    }}>
                                        <Link href="/" style={{
                                            textDecoration: 'none',
                                            color: '#333',
                                            fontWeight: '500',
                                            fontSize: '16px',
                                            padding: '12px 20px',
                                            borderRadius: '8px',
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

                                        {/* ✅ FIXED: List Business FREE - NO LOGIN CHECK - DIRECT LINK */}
                                        <Link
                                            href="/list-your-business"
                                            style={{
                                                color: '#27ae60',
                                                fontWeight: 'bold',
                                                background: '#f0fff4',
                                                padding: '12px 20px',
                                                borderRadius: '25px',
                                                border: '2px solid #27ae60',
                                                textDecoration: 'none',
                                                fontSize: '15px',
                                                transition: 'all 0.3s ease',
                                                display: 'inline-block'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#27ae60';
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#f0fff4';
                                                e.currentTarget.style.color = '#27ae60';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            📍 List Business FREE
                                        </Link>
                                    </nav>

                                    {/* User Access Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'center'
                                    }}>
                                        {isLoggedIn ? (
                                            <>
                                                {/* User Welcome with Dropdown */}
                                                <div className="user-welcome" style={{ position: 'relative' }}>
                                                    <button
                                                        onClick={toggleUserDropdown}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#333',
                                                            cursor: 'pointer',
                                                            padding: '12px 16px', // ✅ PADDING INCREASED
                                                            borderRadius: '8px',
                                                            transition: 'all 0.3s ease',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '14px',
                                                            fontWeight: '500'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = '#3498db';
                                                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = '#333';
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }}
                                                        title="User Menu"
                                                    >
                                                        <i className="pe-7s-user" style={{ fontSize: '16px' }}></i>
                                                        {user?.fullName?.split(' ')[0] || 'User'}
                                                        <i
                                                            className={`pe-7s-angle-down`}
                                                            style={{
                                                                fontSize: '12px',
                                                                transition: 'transform 0.3s ease',
                                                                transform: showUserDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                                                            }}
                                                        ></i>
                                                    </button>

                                                    {/* User Dropdown Menu */}
                                                    {showUserDropdown && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            right: 0,
                                                            background: 'white',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                                            minWidth: '180px',
                                                            zIndex: 1002,
                                                            marginTop: '5px'
                                                        }}>
                                                            {/* User Info */}
                                                            <div style={{
                                                                padding: '12px',
                                                                borderBottom: '1px solid #f0f0f0',
                                                                background: '#f8f9fa'
                                                            }}>
                                                                <div style={{
                                                                    fontWeight: '600',
                                                                    color: '#333',
                                                                    marginBottom: '2px',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    {user?.fullName}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '11px',
                                                                    color: '#666'
                                                                }}>
                                                                    {user?.mobile}
                                                                </div>
                                                            </div>

                                                            {/* Dropdown Links */}
                                                            <div style={{ padding: '6px 0' }}>
                                                                <Link
                                                                    href="/UserDashboard"
                                                                    onClick={() => setShowUserDropdown(false)}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        padding: '10px 16px', // ✅ PADDING INCREASED
                                                                        color: '#333',
                                                                        textDecoration: 'none',
                                                                        transition: 'all 0.3s ease',
                                                                        fontSize: '13px'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = '#f0f8ff';
                                                                        e.currentTarget.style.color = '#3498db';
                                                                    }}
                                                                >
                                                                    <i className="pe-7s-graph1" style={{ fontSize: '14px' }}></i>
                                                                    Dashboard
                                                                </Link>

                                                                <Link
                                                                    href="/profile"
                                                                    onClick={() => setShowUserDropdown(false)}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        padding: '10px 16px', // ✅ PADDING INCREASED
                                                                        color: '#333',
                                                                        textDecoration: 'none',
                                                                        transition: 'all 0.3s ease',
                                                                        fontSize: '13px'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = '#f0f8ff';
                                                                        e.currentTarget.style.color = '#3498db';
                                                                    }}
                                                                >
                                                                    <i className="pe-7s-user" style={{ fontSize: '14px' }}></i>
                                                                    My Profile
                                                                </Link>

                                                                <div style={{
                                                                    height: '1px',
                                                                    background: '#f0f0f0',
                                                                    margin: '6px 0'
                                                                }}></div>

                                                                <button
                                                                    onClick={handleLogout}
                                                                    style={{
                                                                        width: '100%',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        padding: '10px 16px', // ✅ PADDING INCREASED
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#e74c3c',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.3s ease',
                                                                        fontSize: '13px',
                                                                        textAlign: 'left'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = '#fdf2f2';
                                                                        e.currentTarget.style.color = '#c0392b';
                                                                    }}
                                                                >
                                                                    <i className="pe-7s-power" style={{ fontSize: '14px' }}></i>
                                                                    Logout
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setShowLoginModal(true)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#666',
                                                        cursor: 'pointer',
                                                        padding: '12px 16px', // ✅ PADDING INCREASED
                                                        borderRadius: '8px',
                                                        transition: 'all 0.3s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '14px',
                                                        fontWeight: '500'
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
                                                    <i className="pe-7s-user" style={{ fontSize: '16px' }}></i>
                                                    Login
                                                </button>
                                                <button
                                                    onClick={() => setShowRegisterModal(true)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#666',
                                                        cursor: 'pointer',
                                                        padding: '12px 16px', // ✅ PADDING INCREASED
                                                        borderRadius: '8px',
                                                        transition: 'all 0.3s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '14px',
                                                        fontWeight: '500'
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
                                                    <i className="pe-7s-add-user" style={{ fontSize: '16px' }}></i>
                                                    Sign Up
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Get App Button - LAST on Right Side */}
                                    <button
                                        onClick={handleGetApp}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            padding: '12px 24px', // ✅ PADDING INCREASED
                                            borderRadius: '25px',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                        }}
                                        title="Get Our App"
                                    >
                                        <i className="pe-7s-cloud-download" style={{ fontSize: '16px' }}></i>
                                        Get App
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* ✅ MOBILE LAYOUT - Menu Left, Logo Center, Get App Right */
                            <div className="col-12" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                height: '70px',
                                position: 'relative',
                                width: '100%'
                            }}>
                                {/* Menu Button - Left Side */}
                                <button
                                    type="button"
                                    aria-label="Toggle menu"
                                    className="btn_mobile"
                                    onClick={toggleMenu}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '12px 16px', // ✅ PADDING ADDED
                                        cursor: 'pointer',
                                        flex: '0 0 auto',
                                        zIndex: 1001,
                                        width: '50px'
                                    }}
                                >
                                    <div className={`hamburger hamburger--spin ${isMenuOpen ? 'is-active' : ''}`}>
                                        <div className="hamburger-box">
                                            <div className="hamburger-inner"></div>
                                        </div>
                                    </div>
                                </button>

                                {/* Logo - Center - PERFECTLY CENTERED */}
                                <div id="logo_home">
                                    <h1 style={{ margin: 0 }}>
                                        <Link href="/" title="Publicin">
                                            Publicin
                                        </Link>
                                    </h1>
                                </div>

                                {/* Get App Button - RIGHT Side - FIXED POSITION */}
                                <div style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1001
                                }}>
                                    <button
                                        onClick={handleGetApp}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            padding: '10px 16px', // ✅ PADDING INCREASED
                                            borderRadius: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            boxShadow: '0 3px 10px rgba(102, 126, 234, 0.3)',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title="Get Our App"
                                    >
                                        <i className="pe-7s-cloud-download" style={{ fontSize: '14px' }}></i>
                                        Get App
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {!isMobile && isLoading && (
                            <div className="col-lg-9">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>
                                    <div style={{
                                        width: '80px',
                                        height: '16px',
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
                            padding: '20px',
                            backdropFilter: 'blur(5px)',
                            overflow: 'auto'
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '450px',
                                margin: 'auto'
                            }}
                        >
                            <AwesomeLogin
                                onLogin={handleLoginSuccess}
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

                {/* Signup Modal */}
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
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            zIndex: 10001,
                            padding: '20px',
                            backdropFilter: 'blur(5px)',
                            overflow: 'auto'
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                margin: '20px auto'
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

                {/* Mobile Menu */}
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
                    <div style={{ padding: '20px', marginTop: '70px' }}>
                        {/* Navigation Links */}
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '12px' }}>
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

                            {isLoggedIn && (
                                <li style={{ marginBottom: '12px' }}>
                                    <Link
                                        href="/UserDashboard"
                                        onClick={closeMenu}
                                        style={{
                                            display: 'block',
                                            padding: '12px 15px',
                                            color: '#3498db',
                                            textDecoration: 'none',
                                            borderRadius: '6px',
                                            transition: 'all 0.3s ease',
                                            background: '#f0f8ff',
                                            fontWeight: '500'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#3498db';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                    >
                                        📊 Dashboard
                                    </Link>
                                </li>
                            )}

                            {/* ✅ FIXED: Mobile Menu - List Business FREE - NO LOGIN CHECK - DIRECT LINK */}
                            <li style={{ marginBottom: '12px' }}>
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

                        {/* Get App Button in Mobile Menu */}
                        <div style={{ margin: '20px 0' }}>
                            <button
                                onClick={() => {
                                    handleGetApp();
                                    closeMenu();
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                }}
                            >
                                <i className="pe-7s-cloud-download" style={{ fontSize: '16px' }}></i>
                                Download Our App
                            </button>
                        </div>

                        {/* User Section */}
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
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

            {/* ✅ ADDED: Spacer for fixed header - HEIGHT 85px */}
            <div style={{
                height: isSticky ? '85px' : '85px',
                transition: 'height 0.3s ease'
            }}></div>

            {/* Custom CSS */}
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

        /* Sticky header animation */
        .header_sticky {
          transition: all 0.3s ease;
        }

        .sticky-active {
          box-shadow: 0 2px 15px rgba(0,0,0,0.1) !important;
          background: white !important;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .awesome-auth-modal {
            margin: 10px;
          }
          
          .modal-overlay {
            padding: 10px !important;
          }
        }

        /* Hamburger animation */
        .hamburger {
          padding: 0;
          display: inline-block;
          cursor: pointer;
          transition-property: opacity, filter;
          transition-duration: 0.15s;
          transition-timing-function: linear;
          font: inherit;
          color: inherit;
          text-transform: none;
          background-color: transparent;
          border: 0;
          margin: 0;
          overflow: visible;
        }

        .hamburger-box {
          width: 24px;
          height: 24px;
          display: inline-block;
          position: relative;
        }

        .hamburger-inner {
          display: block;
          top: 50%;
          margin-top: -2px;
        }

        .hamburger-inner, .hamburger-inner::before, .hamburger-inner::after {
          width: 24px;
          height: 3px;
          background-color: #333;
          border-radius: 4px;
          position: absolute;
          transition-property: transform;
          transition-duration: 0.15s;
          transition-timing-function: ease;
        }

        .hamburger-inner::before, .hamburger-inner::after {
          content: "";
          display: block;
        }

        .hamburger-inner::before {
          top: -8px;
        }

        .hamburger-inner::after {
          bottom: -8px;
        }

        .hamburger--spin .hamburger-inner {
          transition-duration: 0.22s;
          transition-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
        }

        .hamburger--spin .hamburger-inner::before {
          transition: top 0.1s 0.25s ease-in, opacity 0.1s ease-in;
        }

        .hamburger--spin .hamburger-inner::after {
          transition: bottom 0.1s 0.25s ease-in, transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19);
        }

        .hamburger--spin.is-active .hamburger-inner {
          transform: rotate(225deg);
          transition-delay: 0.12s;
          transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        .hamburger--spin.is-active .hamburger-inner::before {
          top: 0;
          opacity: 0;
          transition: top 0.1s ease-out, opacity 0.1s 0.12s ease-out;
        }

        .hamburger--spin.is-active .hamburger-inner::after {
          bottom: 0;
          transform: rotate(-90deg);
          transition: bottom 0.1s ease-out, transform 0.22s 0.12s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
      `}</style>
        </div>
    );
};

export default Header;