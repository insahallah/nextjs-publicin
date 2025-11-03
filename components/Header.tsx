'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchType, setSearchType] = useState('all');
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  const toggleMenu = () => {
    console.log('Toggling menu:', !isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setActiveSubmenu(null);
    }
  };

  const closeMenu = () => {
    console.log('Closing menu');
    setIsMenuOpen(false);
    setActiveSubmenu(null);
  };

  const toggleSubmenu = (index: number) => {
    console.log('Toggling submenu:', index);
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  // ESC key press par menu close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

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
        >
          <div className={`hamburger hamburger--spin ${isMenuOpen ? 'is-active' : ''}`}>
            <div className="hamburger-box">
              <div className="hamburger-inner"></div>
            </div>
          </div>
          <span className="menu-text">Menu</span>
        </button>
        
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-6">
              <div id="logo_home">
                <h1>
                  <Link href="/" title="Findoctor">Findoctor</Link>
                </h1>
              </div>
            </div>
            <div className="col-lg-9 col-6">
              <ul id="top_access">
                <li><Link href="/login"><i className="pe-7s-user"></i></Link></li>
                <li><Link href="/register-doctor"><i className="pe-7s-add-user"></i></Link></li>
              </ul>
              
              {/* Desktop Menu - Only visible on large screens */}
              <nav id="menu" className="main-menu desktop-menu">
                <ul>
                  <li>
                    <span><Link href="#0">Home</Link></span>
                    <ul>
                      <li><Link href="/">Home Default</Link></li>
                      <li><Link href="/home-kenburns">KenBurns Slider</Link></li>
                      <li><Link href="/home-v2">Home Version 2</Link></li>
                      <li><Link href="/home-v3">Home Version 3</Link></li>
                      <li><Link href="/home-v4">Home Version 4</Link></li>
                      <li><Link href="/home-map">Home with Map</Link></li>
                      <li><Link href="/home-revolution">Revolution Slider</Link></li>
                      <li><Link href="/home-cookie">With Cookie Bar</Link></li>
                    </ul>
                  </li>
                  
                  <li>
                    <span><Link href="#0">Pages</Link></span>
                    <ul>
                      <li>
                        <span><Link href="#0">List pages</Link></span>
                        <ul>
                          <li><Link href="/list">List page</Link></li>
                          <li><Link href="/grid-list">List grid page</Link></li>
                          <li><Link href="/list-map">List map page</Link></li>
                        </ul>
                      </li>
                      <li>
                        <span><Link href="#0">Detail pages</Link></span>
                        <ul>
                          <li><Link href="/detail-page">Detail page</Link></li>
                          <li><Link href="/detail-page-2">Detail page 2</Link></li>
                          <li><Link href="/detail-page-3">Detail page 3</Link></li>
                          <li><Link href="/detail-page-working-booking">Detail working booking</Link></li>
                        </ul>
                      </li>
                      <li><Link href="/submit-review">Submit Review</Link></li>
                      <li><Link href="/blog">Blog</Link></li>
                      <li><Link href="/badges">Badges</Link></li>
                      <li><Link href="/login">Login</Link></li>
                      <li><Link href="/login-2">Login 2</Link></li>
                      <li><Link href="/register-doctor">Register Doctor</Link></li>
                      <li><Link href="/register-doctor-working">Working doctor register</Link></li>
                      <li><Link href="/register">Register</Link></li>
                      <li><Link href="/about">About Us</Link></li>
                      <li><Link href="/contacts">Contacts</Link></li>
                    </ul>
                  </li>
                  
                  <li>
                    <span><Link href="#0">Extra Elements</Link></span>
                    <ul>
                      <li><Link href="/detail-page-working-booking">Detail working booking</Link></li>
                      <li><Link href="/booking-page">Booking page</Link></li>
                      <li><Link href="/confirm">Confirm page</Link></li>
                      <li><Link href="/faq">Faq page</Link></li>
                      <li><Link href="/coming_soon">Coming soon</Link></li>
                      <li>
                        <span><Link href="#0">Pricing tables</Link></span>
                        <ul>
                          <li><Link href="/pricing-tables-1">Pricing tables 1</Link></li>
                          <li><Link href="/pricing-tables-2">Pricing tables 2</Link></li>
                          <li><Link href="/pricing-tables-3">Pricing tables 3</Link></li>
                        </ul>
                      </li>
                      <li><Link href="/icon-pack-1">Icon pack 1</Link></li>
                      <li><Link href="/icon-pack-2">Icon pack 2</Link></li>
                      <li><Link href="/icon-pack-3">Icon pack 3</Link></li>
                      <li><Link href="/404">404 page</Link></li>
                    </ul>
                  </li>
                  
                  <li><span><Link href="/menu_2">Menu V2</Link></span></li>
                  <li>
                    <span>
                      <Link href="/admin" target="_blank" rel="noopener noreferrer">
                        Admin
                      </Link>
                    </span>
                  </li>
                  <li>
                    <span>
                      <Link 
                        href="https://1.envato.market/1kDnR" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Buy this template
                      </Link>
                    </span>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

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
        
        {/* Mobile Menu - Sliding from left side */}
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
          <div className="mobile-menu-header" style={{
            padding: '1rem',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>Findoctor Menu</h3>
            <button 
              className="close-menu" 
              onClick={closeMenu}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
          
          <div className="mobile-menu-content" style={{ padding: '1rem' }}>
            <ul className="mobile-main-menu" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {/* Home Menu Item */}
              <li className={`menu-item ${activeSubmenu === 0 ? 'active' : ''}`} style={{ marginBottom: '0.5rem' }}>
                <div 
                  className="menu-link" 
                  onClick={() => toggleSubmenu(0)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>Home</span>
                  <span className="menu-arrow" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {activeSubmenu === 0 ? '−' : '+'}
                  </span>
                </div>
                <ul 
                  className="submenu" 
                  style={{ 
                    listStyle: 'none',
                    padding: '0.5rem 0',
                    margin: '0.5rem 0 0 0',
                    display: activeSubmenu === 0 ? 'block' : 'none'
                  }}
                >
                  {[
                    { href: '/', text: 'Home Default' },
                    { href: '/home-kenburns', text: 'KenBurns Slider' },
                    { href: '/home-v2', text: 'Home Version 2' },
                    { href: '/home-v3', text: 'Home Version 3' },
                    { href: '/home-v4', text: 'Home Version 4' },
                    { href: '/home-map', text: 'Home with Map' },
                    { href: '/home-revolution', text: 'Revolution Slider' },
                    { href: '/home-cookie', text: 'With Cookie Bar' }
                  ].map((item, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>
                      <Link 
                        href={item.href} 
                        onClick={closeMenu} 
                        style={{ 
                          textDecoration: 'none', 
                          color: '#495057',
                          display: 'block',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Pages Menu Item */}
              <li className={`menu-item ${activeSubmenu === 1 ? 'active' : ''}`} style={{ marginBottom: '0.5rem' }}>
                <div 
                  className="menu-link" 
                  onClick={() => toggleSubmenu(1)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>Pages</span>
                  <span className="menu-arrow" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {activeSubmenu === 1 ? '−' : '+'}
                  </span>
                </div>
                <ul 
                  className="submenu" 
                  style={{ 
                    listStyle: 'none',
                    padding: '0.5rem 0',
                    margin: '0.5rem 0 0 0',
                    display: activeSubmenu === 1 ? 'block' : 'none'
                  }}
                >
                  {[
                    { href: '/list', text: 'List page' },
                    { href: '/grid-list', text: 'List grid page' },
                    { href: '/list-map', text: 'List map page' },
                    { href: '/detail-page', text: 'Detail page' },
                    { href: '/detail-page-2', text: 'Detail page 2' },
                    { href: '/detail-page-3', text: 'Detail page 3' },
                    { href: '/detail-page-working-booking', text: 'Detail working booking' },
                    { href: '/submit-review', text: 'Submit Review' },
                    { href: '/blog', text: 'Blog' },
                    { href: '/badges', text: 'Badges' },
                    { href: '/login', text: 'Login' },
                    { href: '/login-2', text: 'Login 2' },
                    { href: '/register-doctor', text: 'Register Doctor' },
                    { href: '/register-doctor-working', text: 'Working doctor register' },
                    { href: '/register', text: 'Register' },
                    { href: '/about', text: 'About Us' },
                    { href: '/contacts', text: 'Contacts' }
                  ].map((item, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>
                      <Link 
                        href={item.href} 
                        onClick={closeMenu} 
                        style={{ 
                          textDecoration: 'none', 
                          color: '#495057',
                          display: 'block',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Extra Elements Menu Item */}
              <li className={`menu-item ${activeSubmenu === 2 ? 'active' : ''}`} style={{ marginBottom: '0.5rem' }}>
                <div 
                  className="menu-link" 
                  onClick={() => toggleSubmenu(2)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>Extra Elements</span>
                  <span className="menu-arrow" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {activeSubmenu === 2 ? '−' : '+'}
                  </span>
                </div>
                <ul 
                  className="submenu" 
                  style={{ 
                    listStyle: 'none',
                    padding: '0.5rem 0',
                    margin: '0.5rem 0 0 0',
                    display: activeSubmenu === 2 ? 'block' : 'none'
                  }}
                >
                  {[
                    { href: '/detail-page-working-booking', text: 'Detail working booking' },
                    { href: '/booking-page', text: 'Booking page' },
                    { href: '/confirm', text: 'Confirm page' },
                    { href: '/faq', text: 'Faq page' },
                    { href: '/coming_soon', text: 'Coming soon' },
                    { href: '/pricing-tables-1', text: 'Pricing tables 1' },
                    { href: '/pricing-tables-2', text: 'Pricing tables 2' },
                    { href: '/pricing-tables-3', text: 'Pricing tables 3' },
                    { href: '/icon-pack-1', text: 'Icon pack 1' },
                    { href: '/icon-pack-2', text: 'Icon pack 2' },
                    { href: '/icon-pack-3', text: 'Icon pack 3' },
                    { href: '/404', text: '404 page' }
                  ].map((item, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>
                      <Link 
                        href={item.href} 
                        onClick={closeMenu} 
                        style={{ 
                          textDecoration: 'none', 
                          color: '#495057',
                          display: 'block',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Simple Menu Items */}
              {[
                { href: '/menu_2', text: 'Menu V2' },
                { href: '/admin', text: 'Admin', external: true },
                { href: 'https://1.envato.market/1kDnR', text: 'Buy this template', external: true }
              ].map((item, index) => (
                <li key={index} className="menu-item" style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    href={item.href} 
                    className="menu-link-simple" 
                    onClick={closeMenu}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: '#495057',
                      fontWeight: '500',
                      border: '1px solid #e9ecef',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Footer in Mobile Menu */}
            <div className="mobile-menu-footer" style={{ 
              marginTop: '2rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid #dee2e6', 
              textAlign: 'center' 
            }}>
              <p style={{ 
                margin: 0, 
                color: '#6c757d', 
                fontSize: '0.875rem',
                fontWeight: '400'
              }}>
                &copy; 2024 Findoctor. All rights reserved.
              </p>
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