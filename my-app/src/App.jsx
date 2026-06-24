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
import { ThemeProvider } from './contexts/ThemeContext';
import useFavicon from './hooks/useFavicon';

// Lazy load pages for better code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ApplyPage = lazy(() => import('./pages/ApplyPage'));
const PavanPage = lazy(() => import('./pages/PavanPage'));
const GadaPage = lazy(() => import('./pages/GadaPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'));
const QueenBeeGame = lazy(() => import('./pages/QueenBeeGame'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading fallback component
const PageLoader = () => <GameLoader message="Loading Game..." />;

// Pages where the ambient canvas background is suppressed
const NO_BG_PATHS = ['/', '/pavan', '/login', '/queenbee', '/gada'];

function AppShell() {
  const { pathname } = useLocation();
  const showBg = !NO_BG_PATHS.includes(pathname);
  const isQueenBee = pathname === '/queenbee';
  const isStandaloneGada = pathname === '/gada';

  // Pavan page gets its own full-screen layout (no shared footer padding)
  const isPavan = pathname === '/pavan' || pathname === '/';
  const isMinimalScreen = isStandaloneGada;

  // Animate favicon when tab is inactive
  useFavicon('/pavan_icon.png', 1000);

  useEffect(() => {
    document.body.classList.toggle('gada-standalone-page', isStandaloneGada);

    return () => {
      document.body.classList.remove('gada-standalone-page');
    };
  }, [isStandaloneGada]);

  const fallback = isStandaloneGada ? (
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
          <Route path="/" element={<PavanPage />} />
          <Route path="/pavan" element={<PavanPage />} />
          <Route path="/gada" element={<GadaPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/apply" element={<ApplyPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/queenbee" element={<QueenBeeGame />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Catch-all → 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {!isPavan && !isMinimalScreen && <Footer />}
      {!isMinimalScreen && <FloatingDiscordJoin />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
