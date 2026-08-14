import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NotFoundPage.css';

const NotFoundPage = () => (
  <div className="nf-root">
    {/* Logo — matches v2 chrome */}
    <div className="nf-logo">
      <img src="/logo.png" alt="Fluke Games" className="nf-logo__img" />
    </div>

    <motion.div
      className="nf-content"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="nf-code"
        animate={{
          x: [0, -2, 2, -1, 1, 0],
          textShadow: [
            '0 0 0px rgba(255,215,0,0)',
            '-2px 0 8px rgba(255,0,0,0.6)',
            '2px 0 8px rgba(0,255,255,0.6)',
            '0 0 8px rgba(255,215,0,0.6)',
          ],
        }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2.5 }}
      >
        404
      </motion.div>

      <div className="nf-divider" />

      <h1 className="nf-title">Level Not Found</h1>
      <p className="nf-message">
        This path doesn't exist in the saga.
      </p>

      <div className="nf-actions">
        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className="nf-btn nf-btn--primary">Return to Base</Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
          <button onClick={() => window.history.back()} className="nf-btn nf-btn--secondary">
            Go Back
          </button>
        </motion.div>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;
