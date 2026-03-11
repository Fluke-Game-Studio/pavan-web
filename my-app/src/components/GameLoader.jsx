import { motion } from 'framer-motion';
import './GameLoader.css';

const GameLoader = ({ message = "Loading..." }) => {
  return (
    <div className="game-loader">
      <div className="game-loader__content">
        {/* Pixelated game controller */}
        <motion.div 
          className="game-loader__controller"
          animate={{ 
            y: [0, -10, 0],
            rotate: [-5, 5, -5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {/* D-pad */}
            <rect x="15" y="35" width="8" height="8" fill="currentColor" />
            <rect x="23" y="35" width="8" height="8" fill="currentColor" opacity="0.7" />
            <rect x="15" y="43" width="8" height="8" fill="currentColor" opacity="0.7" />
            <rect x="23" y="43" width="8" height="8" fill="currentColor" />
            <rect x="15" y="51" width="8" height="8" fill="currentColor" />
            <rect x="23" y="51" width="8" height="8" fill="currentColor" opacity="0.7" />
            
            {/* Buttons */}
            <circle cx="54" cy="39" r="4" fill="currentColor" />
            <circle cx="62" cy="47" r="4" fill="currentColor" opacity="0.7" />
            <circle cx="46" cy="47" r="4" fill="currentColor" opacity="0.7" />
            <circle cx="54" cy="55" r="4" fill="currentColor" />
            
            {/* Controller body */}
            <rect x="10" y="30" width="60" height="35" fill="none" stroke="currentColor" strokeWidth="2" rx="8" />
            <rect x="35" y="25" width="10" height="5" fill="currentColor" opacity="0.5" />
          </svg>
        </motion.div>

        {/* Loading dots */}
        <div className="game-loader__text">
          <span className="game-loader__message">{message}</span>
          <div className="game-loader__dots">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="game-loader__dot"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              >
                ▪
              </motion.span>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="game-loader__bar">
          <motion.div 
            className="game-loader__bar-fill"
            animate={{ width: ["0%", "100%"] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GameLoader;
