import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found">
      <motion.div 
        className="not-found__content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="not-found__glitch"
          animate={{ 
            x: [0, -2, 2, -1, 1, 0],
            textShadow: [
              '0 0 0px rgba(255, 215, 0, 0)',
              '-2px 0 5px rgba(255, 0, 0, 0.7)',
              '2px 0 5px rgba(0, 255, 255, 0.7)',
              '0 0 5px rgba(255, 215, 0, 0.7)',
            ]
          }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          <h1 className="not-found__code">404</h1>
        </motion.div>
        
        <h2 className="not-found__title">Level Not Found</h2>
        <p className="not-found__message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <motion.div
          className="not-found__pixel-art"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {/* Pixel skull icon */}
            <rect x="20" y="10" width="40" height="40" fill="var(--volt-primary)" />
            <rect x="15" y="15" width="10" height="10" fill="var(--surface-color)" />
            <rect x="55" y="15" width="10" height="10" fill="var(--surface-color)" />
            <rect x="30" y="30" width="20" height="10" fill="var(--surface-color)" />
            <rect x="25" y="50" width="10" height="10" fill="var(--surface-color)" />
            <rect x="45" y="50" width="10" height="10" fill="var(--surface-color)" />
          </svg>
        </motion.div>
        
        <div className="not-found__actions">
          <Link to="/" className="not-found__button not-found__button--primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0L0 6v10h6v-6h4v6h6V6L8 0z"/>
            </svg>
            Return to Base
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="not-found__button not-found__button--secondary"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7 12V8H5.5L8 4l2.5 4H9v4H7z"/>
            </svg>
            Go Back
          </button>
        </div>
        
        <div className="not-found__hint">
          <p>Looking for something specific?</p>
          <div className="not-found__links">
            <Link to="/careers">Careers</Link>
            <Link to="/showcase">Showcase</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
