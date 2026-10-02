import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="theme-toggle__track"
        animate={{ backgroundColor: isDark ? '#2A2A2D' : '#FFD700' }}
      >
        <motion.div
          className="theme-toggle__thumb"
          animate={{ x: isDark ? 0 : 24 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isDark ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0.5a7.5 7.5 0 105.196 12.946A6.5 6.5 0 018 0.5z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="3.5" />
              <path d="M8 0v2M8 14v2M2.343 2.343l1.414 1.414M12.243 12.243l1.414 1.414M0 8h2M14 8h2M2.343 13.657l1.414-1.414M12.243 3.757l1.414-1.414" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" />
            </svg>
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
