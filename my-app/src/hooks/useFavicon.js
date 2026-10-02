import { useEffect, useRef } from 'react';

/**
 * Custom hook to create an animated favicon that pulses when the tab is inactive
 * @param {string} defaultFavicon - Path to the default favicon
 * @param {number} interval - Animation interval in milliseconds (default: 1000)
 */
const useFavicon = (defaultFavicon = '/logo.png', interval = 1000) => {
  const faviconRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Find or create the favicon link element
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    faviconRef.current = link;

    // Create canvas for dynamic favicon generation
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    canvasRef.current = canvas;

    // Load the default favicon image
    const img = new Image();
    img.src = defaultFavicon;
    
    let isGlowing = false;

    img.onload = () => {
      const ctx = canvas.getContext('2d');

      const drawFavicon = (glow = false) => {
        ctx.clearRect(0, 0, 32, 32);

        if (glow) {
          // Add glow effect
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        ctx.drawImage(img, 0, 0, 32, 32);
        
        if (glow) {
          ctx.shadowBlur = 0;
        }

        faviconRef.current.href = canvas.toDataURL('image/png');
      };

      // Initial draw
      drawFavicon(false);

      // Animate favicon when tab is not visible
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Start animation when tab becomes hidden
          animationRef.current = setInterval(() => {
            isGlowing = !isGlowing;
            drawFavicon(isGlowing);
          }, interval);
        } else {
          // Stop animation and reset to default when tab becomes visible
          if (animationRef.current) {
            clearInterval(animationRef.current);
            animationRef.current = null;
          }
          isGlowing = false;
          drawFavicon(false);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    };

    img.onerror = () => {
      console.error('Failed to load favicon:', defaultFavicon);
    };

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [defaultFavicon, interval]);

  return null;
};

export default useFavicon;
