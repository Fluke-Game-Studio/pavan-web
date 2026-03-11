import React, { lazy, Suspense } from 'react';
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
import { ThemeProvider } from './contexts/ThemeContext';
import useFavicon from './hooks/useFavicon';

// Lazy load pages for better code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ApplyPage = lazy(() => import('./pages/ApplyPage'));
const PavanPage = lazy(() => import('./pages/PavanPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'));
const QueenBeeGame = lazy(() => import('./pages/QueenBeeGame'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading fallback component
const PageLoader = () => <GameLoader message="Loading Game..." />;

// Pages where the ambient canvas background is suppressed
const NO_BG_PATHS = ['/pavan', '/login', '/queenbee'];

function AppShell() {
  const { pathname } = useLocation();
  const showBg = !NO_BG_PATHS.includes(pathname);
  const isQueenBee = pathname === '/queenbee';

  // Pavan page gets its own full-screen layout (no shared footer padding)
  const isPavan = pathname === '/pavan';

  // Animate favicon when tab is inactive
  useFavicon('/pavan_icon.png', 1000);

  return (
    <div className="app">
      <ScrollProgress />
      {!isQueenBee && <CustomCursor />}
      {showBg && <AmbientBackground />}
      {showBg && <ParticleField />}
      {!isQueenBee && <GadaSmash />}
      <Navbar />
      <Breadcrumbs />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/apply" element={<ApplyPage />} />
          <Route path="/pavan" element={<PavanPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/queenbee" element={<QueenBeeGame />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Catch-all → 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {!isPavan && <Footer />}
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
