import localFont from 'next/font/local';

/**
 * Inter is self-hosted from @fontsource-variable/inter (one variable file,
 * latin subset, 100–900 weights). No request ever leaves for Google Fonts:
 * faster first paint, no third-party privacy hop, and builds that don't
 * depend on network access.
 */
const inter = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2',
      weight: '100 900',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
});
import './globals.css';


import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { BrandingProvider } from '@/components/providers/BrandingProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LayoutBootstrap } from '@/components/layout-bootstrap';
import { VoltaSplash } from '@/components/ui/VoltaSplash';
import { SecurityNode } from '@/components/security-node';
import { LazyMotion, domMax } from "framer-motion";
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CompareProvider } from '@/context/CompareContext';
import { CompareBar } from '@/components/ui/CompareBar';

export const metadata = {
  metadataBase: new URL('https://voltashowroom.co.tz'),
  title: 'ShowroomTZ - Premium Car Showroom Tanzania',
  description: 'Browse verified vehicles from Tanzania\'s most trusted dealers and private showrooms. SUVs, Sedans, Luxury cars in Dar es Salaam, Arusha, and Zanzibar.',
  keywords: 'car showroom Tanzania, buy car Dar es Salaam, luxury cars Arusha, vehicle marketplace',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_TZ',
    url: 'https://voltashowroom.co.tz',
    siteName: 'ShowroomTZ Tanzania',
    title: 'ShowroomTZ — Tanzania\'s Premier Showroom',
    description: 'Verified dealers, transparent pricing, nationwide delivery. SUVs, sedans and luxury cars across Dar es Salaam, Arusha and Zanzibar.',
    images: [{ url: '/icons/og-image.png', width: 1200, height: 630, alt: 'ShowroomTZ — Tanzania\'s Premier Showroom' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShowroomTZ — Tanzania\'s Premier Showroom',
    description: 'Verified dealers, transparent pricing, nationwide delivery across Tanzania.',
    images: ['/icons/og-image.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#B91C1C" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ShowroomTZ" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.svg" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
      </head>
      <body className={`${inter.variable} font-body antialiased bg-background`} suppressHydrationWarning>
        {/* CRITICAL: INITIAL BLOCKER TO PREVENT CONTENT FLASH */}
        <div id="initial-global-loader" style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#0a0a1a',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.1s ease' // Ultra-fast transition
        }}></div>

        <LayoutBootstrap />
        
        <FirebaseClientProvider>
          <ThemeProvider>
            <LanguageProvider>
              <BrandingProvider>
                <CompareProvider>
                  <VoltaSplash />
                  <SecurityNode />
                  <LazyMotion features={domMax}>
                    <div className="relative min-h-screen flex flex-col">
                      {children}
                    </div>
                  </LazyMotion>
                  <CompareBar />
                  <ServiceWorkerRegistration />
                  <Toaster />
                  <Analytics />
                  <SpeedInsights />
                </CompareProvider>
              </BrandingProvider>
            </LanguageProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoDealer",
              "name": "ShowroomTZ Tanzania",
              "image": "https://voltashowroom.co.tz/icons/icon-512x512.svg",
              "@id": "https://voltashowroom.co.tz",
              "url": "https://voltashowroom.co.tz",
              "telephone": "+255700000000",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Mikocheni Area",
                "addressLocality": "Dar es Salaam",
                "addressRegion": "Dar es Salaam",
                "addressCountry": "TZ"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -6.7725,
                "longitude": 39.2311
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "00:00",
                "closes": "23:59"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
