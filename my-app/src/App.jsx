import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './views/Navbar';
import Footer from './views/Footer';
import CustomCursor from './views/CustomCursor';
import AmbientBackground from './views/AmbientBackground';
import GadaSmash from './views/GadaSmash';
import GameLoader from './components/GameLoader';
import Breadcrumbs from './components/Breadcrumbs';
import ScrollProgress from './components/ScrollProgress';
import ParticleField from './components/ParticleField';
import FloatingDiscordJoin from './components/FloatingDiscordJoin';
import NewsletterBell from './components/NewsletterBell';
import { ThemeProvider } from './contexts/ThemeContext';
import useFavicon from './hooks/useFavicon';
import WebsiteV2Page from './pages/WebsiteV2Page';

// Lazy load pages for better code splitting
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ApplyPage = lazy(() => import('./pages/ApplyPage'));
const GadaPage = lazy(() => import('./pages/GadaPage'));
const QueenBeeGame = lazy(() => import('./pages/QueenBeeGame'));
const NewsletterUnsubscribe = lazy(() => import('./pages/NewsletterUnsubscribe'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading fallback component
const PageLoader = () => <GameLoader message="Loading Game..." />;

// Pages where the ambient canvas background is suppressed
const NO_BG_PATHS = ['/', '/login', '/queenbee', '/gada', '/unsubscribe'];

function AppShell() {
  const { pathname } = useLocation();
  const showBg = !NO_BG_PATHS.includes(pathname);
  const isQueenBee = pathname === '/queenbee';
  const isStandaloneGada = pathname === '/gada';
  const isUnsubscribe = pathname === '/unsubscribe';
  const isV2 = pathname === '/';

  const KNOWN_PATHS = ['/', '/gada', '/careers', '/careers/apply', '/queenbee', '/unsubscribe'];
  const isNotFound = !KNOWN_PATHS.includes(pathname);
  const isMinimalScreen = isStandaloneGada || isV2 || isNotFound || isUnsubscribe;
  const showDiscordJoin = !isMinimalScreen;
  const showNewsletterBell = pathname !== '/unsubscribe' && pathname !== '/gada' && pathname !== '/queenbee';

  // Animate favicon when tab is inactive
  useFavicon('/pavan_icon.png', 1000);

  useEffect(() => {
    document.body.classList.toggle('gada-standalone-page', isStandaloneGada || isV2);

    return () => {
      document.body.classList.remove('gada-standalone-page');
    };
  }, [isStandaloneGada, isV2]);

  const fallback = (isStandaloneGada || isV2) ? (
    <div
      aria-hidden="true"
      style={{
        minHeight: '100vh',
        width: '100%',
        background:
          'radial-gradient(circle at 50% 20%, rgba(255, 215, 0, 0.16), transparent 35%), radial-gradient(circle at 50% 80%, rgba(232, 56, 58, 0.12), transparent 38%), linear-gradient(180deg, #060607 0%, #0f0f11 100%)',
      }}
    />
  ) : (
    <PageLoader />
  );

  return (
    <div className="app">
      {!isMinimalScreen && <ScrollProgress />}
      {!isQueenBee && !isMinimalScreen && <CustomCursor />}
      {showBg && !isMinimalScreen && <AmbientBackground />}
      {showBg && !isMinimalScreen && <ParticleField />}
      {!isQueenBee && !isMinimalScreen && <GadaSmash />}
      {!isMinimalScreen && <Navbar />}
      {!isMinimalScreen && <Breadcrumbs />}

      <Suspense fallback={fallback}>
        <Routes>
          <Route path="/" element={<WebsiteV2Page />} />
          <Route path="/gada" element={<GadaPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/apply" element={<ApplyPage />} />
          <Route path="/queenbee" element={<QueenBeeGame />} />
          <Route path="/unsubscribe" element={<NewsletterUnsubscribe />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {showDiscordJoin && <Footer />}
      {showDiscordJoin && <FloatingDiscordJoin />}
      {showNewsletterBell && <NewsletterBell stacked={showDiscordJoin} />}
    </div>
  )
}
