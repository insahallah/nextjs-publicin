// components/Sidebar.tsx
'use client'

import { ReactNode } from 'react'

// ✅ Option A: Agar children required nahi hai to interface update karein
interface SidebarProps {
  children?: ReactNode  // ✅ Optional bana dein
}

// ✅ Option B: Ya fir children ko completely hata dein
// interface SidebarProps {
//   // koi specific props agar chahiye
// }

export default function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="sidebar" style={{
      width: '280px',
      background: 'white',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      zIndex: 100
    }}>
      {/* Sidebar content */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Dashboard</h3>
        
        {/* Navigation Links */}
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '8px' }}>
              <a href="/UserDashboard" style={{
                display: 'block',
                padding: '12px 15px',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                📊 Overview
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a href="/my-businesses" style={{
                display: 'block',
                padding: '12px 15px',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                🏢 My Businesses
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a href="/profile" style={{
                display: 'block',
                padding: '12px 15px',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                👤 Profile
              </a>
            </li>
          </ul>
        </nav>

        {/* Agar children hai to display karein */}
        {children}
      </div>

      <style jsx>{`
        .sidebar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 transparent;
        }
        
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        
        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  )
}