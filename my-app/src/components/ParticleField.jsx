import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './ParticleField.css';

const ParticleField = () => {
  const [particles, setParticles] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check theme
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    // Generate particles only on desktop
    if (!isMobile) {
      // Reduce particle count in light theme to avoid interference with content
      const particleCount = theme === 'light' ? 12 : 40;
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Position as percentage
        y: Math.random() * 100,
        size: Math.random() * 4 + 2, // 2-6px
        shape: Math.random() > 0.5 ? 'circle' : 'square',
        duration: Math.random() * 20 + 20, // 20-40s
        delay: Math.random() * 10, // 0-10s initial delay
        // Much lower opacity in light theme
        opacity: theme === 'light' ? Math.random() * 0.05 + 0.01 : Math.random() * 0.25 + 0.1,
        yOffset: Math.random() * 100 - 50, // Random vertical movement range
      }));
      
      setParticles(newParticles);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Don't render on mobile
  if (isMobile || particles.length === 0) {
    return null;
  }

  return (
    <div className="particle-field">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`particle particle--${particle.shape}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, particle.yOffset, 0],
            x: [0, Math.random() * 30 - 15, 0],
            rotate: particle.shape === 'square' ? [0, 180, 360] : 0,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default ParticleField;
