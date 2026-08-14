import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import './ScrollProgress.css';

const ScrollProgress = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Smooth spring animation for the progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Only show progress bar on pages longer than 2000px
    const checkHeight = () => {
      const docHeight = document.documentElement.scrollHeight;
      const viewHeight = window.innerHeight;
      setIsVisible(docHeight > 2000 && docHeight > viewHeight * 1.5);
    };

    checkHeight();
    window.addEventListener('resize', checkHeight);
    
    // Also check on route changes (content might change)
    const observer = new MutationObserver(checkHeight);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    return () => {
      window.removeEventListener('resize', checkHeight);
      observer.disconnect();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div 
      className="scroll-progress"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="scroll-progress__bar"
        style={{ scaleX }}
      />
    </motion.div>
  );
};

export default ScrollProgress;
