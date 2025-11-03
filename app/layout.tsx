import './globals.css';

export const metadata = {
  title: {
    default: 'Publicin - Business Listing Platform',
    template: '%s | Publicin'
  },
  description: 'Doctor, salon, service center, dukaan, ya freelancer dhundo — humari smart directory aapko sahi service samay par dhundne mein madad karti hai.',
  keywords: 'business listing, directory, doctors, salon, services, india, publicin',
  authors: [{ name: 'Publicin' }],
  openGraph: {
    title: 'Publicin - Business Listing Platform',
    description: 'Find the best businesses and services near you',
    type: 'website',
    locale: 'en_IN',
    url: 'https://publicin.in',
    siteName: 'Publicin',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Publicin - Business Listing Platform',
    description: 'Find the best businesses and services near you',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <head>
        {/* Favicons */}
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" type="image/x-icon" href="/apple-touch-icon-57x57-precomposed.png" />
        <link rel="apple-touch-icon" type="image/x-icon" sizes="72x72" href="/apple-touch-icon-72x72-precomposed.png" />
        <link rel="apple-touch-icon" type="image/x-icon" sizes="114x114" href="/apple-touch-icon-114x114-precomposed.png" />
        <link rel="apple-touch-icon" type="image/x-icon" sizes="144x144" href="/apple-touch-icon-144x144-precomposed.png" />

        {/* Google Web Font */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        
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

        {/* Additional meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#007bff" />
      </head>
      <body>
        {children}
        
        {/* Scripts */}
        <script src="/js/jquery-3.7.1.min.js" defer></script>
        <script src="/js/common_scripts.min.js" defer></script>
        <script src="/js/functions.js" defer></script>
        
        {/* Map Scripts */}
        <script src="https://maps.googleapis.com/maps/api/js" defer></script>
        <script src="/js/markerclusterer.js" defer></script>
        <script src="/js/map_listing.js" defer></script>
        <script src="/js/infobox.js" defer></script>
      </body>
    </html>
  );
}