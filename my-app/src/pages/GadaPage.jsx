import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import BlackHoleIntro from '../components/BlackHoleIntro';
import ModelDataTool from '../components/ModelDataTool';
import ParticleMorphScreen from '../components/ParticleMorphScreen';
import './GadaPage.css';

const GadaPage = () => {
  const [showScreen, setShowScreen] = useState(false);
  const [revealScreen, setRevealScreen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [liveGadaPoints, setLiveGadaPoints] = useState(null);
  const transitionTimerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const previousTitle = document.title;

    document.title = 'Interactive Gada | Pavan';

    return () => {
      window.clearTimeout(transitionTimerRef.current);
      document.title = previousTitle;
    };
  }, []);

  const handleEnter = useCallback(() => {
    if (startedRef.current) return;

    startedRef.current = true;
    setShowScreen(true);
    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      setRevealScreen(true);
      setShowIntro(false);
    }, 3000);
  }, []);

  return (
    <main className="gada-page">
      <motion.div
        className="gada-page__screen-layer gada-page__screen-layer--base"
        style={{ pointerEvents: revealScreen ? 'auto' : 'none' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: revealScreen ? 1 : 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {showScreen && <ParticleMorphScreen gadaPointsSource={liveGadaPoints} />}
      </motion.div>

      {showIntro && (
        <motion.div
          key="intro"
          className="gada-page__intro-layer"
          initial={{ opacity: 1 }}
          animate={{ opacity: revealScreen ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <BlackHoleIntro onEnter={handleEnter} />
        </motion.div>
      )}

      <ModelDataTool onGeneratedPoints={setLiveGadaPoints} />
    </main>
  );
};

export default GadaPage;
