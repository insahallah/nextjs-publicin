// components/UserDashboard.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// Import Font Awesome CSS
import '@fortawesome/fontawesome-free/css/all.min.css'

declare global {
  interface Window {
    $: any;
    jQuery: any;
    bootstrap: any;
  }
}

export default function UserDashboard() {
  const router = useRouter()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current || typeof window === 'undefined') return
    isInitialized.current = true

    const initializeDashboard = async () => {
      try {
        // Wait for jQuery and Bootstrap to load
        if (!window.jQuery || !window.bootstrap) {
          setTimeout(initializeDashboard, 100)
          return
        }

        const $ = window.jQuery
        const bootstrap = window.bootstrap

        // Initialize tooltips
        $('[data-toggle="tooltip"]').tooltip()

        // Initialize collapse functionality
        $('.nav-link-collapse').on('click', function(this: HTMLElement) {
          const target = $(this).attr('href')
          if (target) {
            $(target).collapse('toggle')
          }
        })

        console.log('Dashboard initialized successfully')

      } catch (error) {
        console.error('Error initializing dashboard:', error)
      }
    }

    // Start initialization
    initializeDashboard()

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined' && window.jQuery) {
        const $ = window.jQuery
        $('[data-toggle="tooltip"]').tooltip('dispose')
      }
    }
  }, [])

  const handleLogout = () => {
    // Clear localStorage and redirect
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
    }
    router.push('/')
  }

  const handleViewDetails = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    router.push(path)
  }

  return (
    <>
      {/* Load jQuery and Bootstrap JS from CDN */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          window.$ = window.jQuery = require('jquery')
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          window.bootstrap = require('bootstrap')
        }}
      />

      <div className="fixed-nav sticky-footer" id="page-top">
        {/* Navigation */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-default fixed-top" id="mainNav">
          <a className="navbar-brand" href="/">
            <span className="text-white font-weight-bold">PUBLICIN</span>
          </a>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-toggle="collapse" 
            data-target="#navbarResponsive"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarResponsive">
            {/* Sidebar Navigation */}
            <ul className="navbar-nav sidebar">
              {[
                { icon: 'tachometer-alt', text: 'Dashboard', href: '/UserDashboard', active: true },
                { icon: 'envelope', text: 'Messages', href: '/messages' },
                { 
                  icon: 'calendar-check', 
                  text: 'Bookings', 
                  href: '/bookings',
                  badge: '6 New'
                },
                { icon: 'star', text: 'Reviews', href: '/reviews' },
                { icon: 'heart', text: 'Bookmarks', href: '/bookmarks' },
                { icon: 'plus-circle', text: 'Add listing', href: '/list-your-business' }
              ].map((item, index) => (
                <li key={index} className="nav-item" data-toggle="tooltip" data-placement="right" title={item.text}>
                  <a className={`nav-link ${item.active ? 'active' : ''}`} href={item.href}>
                    <i className={`fas fa-${item.icon} fa-fw`}></i>
                    <span className="nav-link-text">
                      {item.text}
                      {item.badge && (
                        <span className="badge badge-pill badge-primary ml-2">{item.badge}</span>
                      )}
                    </span>
                  </a>
                </li>
              ))}

              {/* Profile Dropdown */}
              <li className="nav-item" data-toggle="tooltip" data-placement="right" title="My profile">
                <a className="nav-link nav-link-collapse collapsed" data-toggle="collapse" href="#collapseProfile">
                  <i className="fas fa-user fa-fw"></i>
                  <span className="nav-link-text">My Profile</span>
                </a>
                <ul className="sidenav-second-level collapse" id="collapseProfile">
                  <li><a href="/profile">User Profile</a></li>
                  <li><a href="/business-profile">Business Profile</a></li>
                </ul>
              </li>

              {/* Settings Dropdown */}
              <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Settings">
                <a className="nav-link nav-link-collapse collapsed" data-toggle="collapse" href="#collapseSettings">
                  <i className="fas fa-cog fa-fw"></i>
                  <span className="nav-link-text">Settings</span>
                </a>
                <ul className="sidenav-second-level collapse" id="collapseSettings">
                  <li><a href="/settings">Account Settings</a></li>
                  <li><a href="/notifications">Notifications</a></li>
                </ul>
              </li>
            </ul>

            {/* Top Navigation */}
            <ul className="navbar-nav ml-auto">
              {/* Messages Dropdown */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle mr-lg-2" id="messagesDropdown" href="#" data-toggle="dropdown">
                  <i className="fas fa-envelope fa-fw"></i>
                  <span className="badge badge-primary">12</span>
                </a>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="messagesDropdown">
                  <h6 className="dropdown-header">New Messages:</h6>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">
                    <strong>David Miller</strong>
                    <span className="small text-muted float-right">11:21 AM</span>
                    <div className="dropdown-message small">
                      Hey there! This new version of SB Admin is pretty awesome!
                    </div>
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item small" href="#">View all messages</a>
                </div>
              </li>

              {/* Alerts Dropdown */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle mr-lg-2" id="alertsDropdown" href="#" data-toggle="dropdown">
                  <i className="fas fa-bell fa-fw"></i>
                  <span className="badge badge-warning">6</span>
                </a>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="alertsDropdown">
                  <h6 className="dropdown-header">New Alerts:</h6>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">
                    <span className="text-success">
                      <strong><i className="fas fa-long-arrow-alt-up fa-fw"></i>Status Update</strong>
                    </span>
                    <span className="small text-muted float-right">11:21 AM</span>
                    <div className="dropdown-message small">
                      This is an automated server response message.
                    </div>
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item small" href="#">View all alerts</a>
                </div>
              </li>

              {/* User Dropdown */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" data-toggle="dropdown">
                  <i className="fas fa-user-circle fa-fw"></i>
                </a>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                  <a className="dropdown-item" href="/profile">Profile</a>
                  <a className="dropdown-item" href="/settings">Settings</a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#" data-toggle="modal" data-target="#exampleModal">
                    Logout
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <div className="content-wrapper">
          <div className="container-fluid">
            {/* Breadcrumbs */}
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/UserDashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item active">My Dashboard</li>
            </ol>

            {/* Stats Cards */}
            <div className="row">
              {[
                { count: 26, text: 'New Messages!', color: 'primary', icon: 'envelope', href: '/messages' },
                { count: 11, text: 'New Reviews!', color: 'warning', icon: 'star', href: '/reviews' },
                { count: 10, text: 'New Bookings!', color: 'success', icon: 'calendar-check', href: '/bookings' },
                { count: 10, text: 'New Bookmarks!', color: 'danger', icon: 'heart', href: '/bookmarks' }
              ].map((stat, index) => (
                <div key={index} className="col-xl-3 col-sm-6 mb-4">
                  <div className={`card text-white bg-${stat.color} o-hidden h-100`}>
                    <div className="card-body">
                      <div className="card-body-icon">
                        <i className={`fas fa-${stat.icon} fa-2x`}></i>
                      </div>
                      <div className="mr-5">
                        <h5>{stat.count} {stat.text}</h5>
                      </div>
                    </div>
                    <a 
                      className="card-footer text-white clearfix small z-1" 
                      href={stat.href}
                      onClick={(e) => handleViewDetails(e, stat.href)}
                    >
                      <span className="float-left">View Details</span>
                      <span className="float-right">
                        <i className="fas fa-angle-right"></i>
                      </span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics Section - Chart Removed */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-chart-bar mr-2"></i>Business Overview
                </h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3 className="text-primary">₹2,45,000</h3>
                        <p className="text-muted">Total Revenue</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3 className="text-success">156</h3>
                        <p className="text-muted">Total Customers</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3 className="text-warning">89%</h3>
                        <p className="text-muted">Satisfaction Rate</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3 className="text-info">45</h3>
                        <p className="text-muted">Active Listings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="row">
              <div className="col-lg-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="fas fa-history mr-2"></i>Recent Activity
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="list-group list-group-flush">
                      {[
                        { text: 'New booking received', time: '5 mins ago', type: 'success' },
                        { text: 'New review submitted', time: '15 mins ago', type: 'warning' },
                        { text: 'Profile updated', time: '1 hour ago', type: 'info' },
                        { text: 'Payment received', time: '2 hours ago', type: 'success' }
                      ].map((activity, index) => (
                        <div key={index} className="list-group-item d-flex align-items-center">
                          <div className={`bg-${activity.type} rounded-circle p-2 mr-3`}>
                            <i className="fas fa-circle text-white" style={{ fontSize: '8px' }}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="text-dark">{activity.text}</div>
                            <small className="text-muted">{activity.time}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="fas fa-tasks mr-2"></i>Quick Actions
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {[
                        { icon: 'plus-circle', text: 'Add Business', href: '/list-your-business', color: 'primary' },
                        { icon: 'edit', text: 'Edit Profile', href: '/profile', color: 'success' },
                        { icon: 'chart-line', text: 'View Reports', href: '/reports', color: 'info' },
                        { icon: 'cog', text: 'Settings', href: '/settings', color: 'warning' }
                      ].map((action, index) => (
                        <div key={index} className="col-6 mb-3">
                          <a 
                            href={action.href}
                            className={`btn btn-${action.color} btn-block`}
                            onClick={(e) => handleViewDetails(e, action.href)}
                          >
                            <i className={`fas fa-${action.icon} mr-2`}></i>
                            {action.text}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="sticky-footer bg-white">
          <div className="container my-auto">
            <div className="text-center my-auto">
              <small>Copyright © Publicin 2024</small>
            </div>
          </div>
        </footer>

        {/* Logout Modal */}
        <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ready to Leave?</h5>
                <button type="button" className="close" data-dismiss="modal">
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Select "Logout" below if you are ready to end your current session.
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 225px;
          position: fixed;
          top: 56px;
          left: 0;
          height: calc(100vh - 56px);
          background-color: #343a40;
          padding-top: 20px;
          overflow-y: auto;
        }
        .content-wrapper {
          margin-left: 225px;
          padding: 20px;
          min-height: calc(100vh - 56px);
        }
        .navbar-brand {
          margin-left: 225px;
        }
        .card-body-icon {
          position: absolute;
          z-index: 0;
          top: -1rem;
          right: -1rem;
          opacity: 0.4;
          font-size: 5rem;
          transform: rotate(15deg);
        }
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            position: relative;
            height: auto;
            top: 0;
          }
          .content-wrapper {
            margin-left: 0;
          }
          .navbar-brand {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  )
}