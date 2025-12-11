// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import LoginModalWrapper from '@/components/LoginModalWrapper';
//import { AuthProvider } from './context/AuthContext'; // Import from the correct path

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// -------------------------
// Metadata (Server Component)
// -------------------------
export const metadata: Metadata = {
  title: {
    default: 'PublicIn – Jharkhand No. 1 Business & Rural Listing Platform',
    template: '%s | PublicIn'
  },
  description: 'Doctor, salon, service center, dukaan, ya freelancer dhundna ho — PublicIn aapko sahi business samay par dhundne mein madad karta hai. Gaon se shahar tak: dhan selling, sabji selling, gobar selling, tree selling, bike selling, kawadi wala aur har rural service ek jagah.',
  keywords: 'business listing, directory, doctors, salon, services, india, publicin, jharkhand, ranchi, dhan selling, paddy selling, sabji selling, vegetable selling, gobar selling, cow dung selling, tree selling, timber selling, bike selling, byke selling, kawadi wala, scrap buyer, scrap seller, rural business, village services, gaon services, mandi, farmer help, local search platform',
  authors: [{ name: 'PublicIn' }],
  openGraph: {
    title: 'PublicIn – Jharkhand Business & Rural Services Platform',
    description: 'PublicIn par paaye shahar aur gaon ke behtareen businesses, services aur rural marketplace listings. Doctor, salon, service center ya rural kaam — sab yahin milega.',
    type: 'website',
    locale: 'en_IN',
    url: 'https://publicin.in',
    siteName: 'PublicIn',
    images: [{ url: '/seo.jpg', width: 1200, height: 630, alt: 'PublicIn Business Listing' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PublicIn – Jharkhand Business & Rural Services',
    description: 'PublicIn par paaye doctor, salon, dukaan, service center, freelancer aur rural marketplace listings.',
    images: ['/seo.jpg']
  },
  robots: { index: true, follow: true },
  viewport: 'width=device-width, initial-scale=1.0',
  themeColor: '#3B82F6',
  manifest: '/manifest.json'
};

// -------------------------
// RootLayout (Server Component)
// -------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="scroll-smooth">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="PublicIn" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PublicIn" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3B82F6" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Additional CSS */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
        
        {/* External Libraries */}
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
        
        {/* Analytics Scripts */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />

         {/* Base CSS */}
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/css/style.css" rel="stylesheet" />
        <link href="/css/menu.css" rel="stylesheet" />
        <link href="/css/vendors.css" rel="stylesheet" />
        <link href="/css/icon_fonts/css/all_icons_min.css" rel="stylesheet" />
        
        {/* Specific CSS */}
        <link href="/css/date_picker.css" rel="stylesheet" />
        
        {/* Custom CSS */}
        <link href="/css/custom.css" rel="stylesheet" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PublicIn",
              "url": "https://publicin.in",
              "logo": "https://publicin.in/logo.png",
              "description": "Jharkhand's leading business and rural services listing platform",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Ranchi",
                "addressRegion": "Jharkhand",
                "addressCountry": "IN"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Providers>
          {children}
          <LoginModalWrapper />
        </Providers>
        
        {/* Scripts - Deferred for better performance */}
        <script src="/js/jquery-3.7.1.min.js" defer></script>
        <script src="/js/common_scripts.min.js" defer></script>
        <script src="/js/functions.js" defer></script>
        <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places" defer></script>
        <script src="/js/markerclusterer.js" defer></script>
        <script src="/js/map_listing.js" defer></script>
        <script src="/js/infobox.js" defer></script>
        
        {/* Custom Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize theme
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.classList.toggle('dark', theme === 'dark');
                
                // Handle service worker for PWA
                if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
                
                // Handle offline status
                window.addEventListener('online', () => {
                  document.body.classList.remove('offline');
                });
                
                window.addEventListener('offline', () => {
                  document.body.classList.add('offline');
                });
                
                // Check initial connection status
                if (!navigator.onLine) {
                  document.body.classList.add('offline');
                }
              })();
            `,
          }}
        />
        
        {/* Toast/Snackbar Container */}
        <div id="toast-container" className="fixed bottom-4 right-4 z-50 space-y-2"></div>
        
        {/* Loading Overlay */}
        <div id="loading-overlay" className="fixed inset-0 bg-black/50 z-[100] hidden items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading...</p>
          </div>
        </div>
        
        {/* Modal Container */}
        <div id="modal-container"></div>
      </body>
    </html>
  );
}