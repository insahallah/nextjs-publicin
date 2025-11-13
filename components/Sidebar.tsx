// components/LayoutWithSidebar.tsx
'use client'

import { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function LayoutWithSidebar({ children }: LayoutProps) {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>

      <style jsx>{`
        .layout-wrapper {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }
        
        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 0;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
        }
        
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  )
}