import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './FloatingDiscordJoin.css';

const DISCORD_JOIN_URL = 'https://discord.gg/xDQPgXkj5X';

export default function FloatingDiscordJoin() {
  const [open, setOpen] = useState(false);

  return (
    <div className="floating-discord">
      <AnimatePresence>
        {open ? (
          <motion.div
            className="discord-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="discord-modal"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="discord-modal-title"
            >
              <div className="discord-modal-header">
                <h2 id="discord-modal-title">Join FlukeGameStudio</h2>
                <button
                  type="button"
                  className="discord-modal-close"
                  onClick={() => setOpen(false)}
                  aria-label="Close Discord join dialog"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="discord-modal-actions">
                <a
                  href={DISCORD_JOIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="discord-modal-primary"
                  onClick={() => setOpen(false)}
                >
                  <MessageCircle size={17} aria-hidden="true" />
                  Continue to Discord
                </a>
                <button
                  type="button"
                  className="discord-modal-secondary"
                  onClick={() => {
                    void navigator.clipboard?.writeText(DISCORD_JOIN_URL);
                  }}
                >
                  Copy Invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        className="floating-discord-button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        aria-label="Join Discord server"
        title="Join Discord server"
      >
        <MessageCircle size={17} aria-hidden="true" />
        <span>Join Discord</span>
      </motion.button>
    </div>
  );
}
