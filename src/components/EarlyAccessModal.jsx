import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGoogle, FaGooglePlay } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";

function EarlyAccessModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl border border-white/20 bg-surface shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-surface/95 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3">
                <FaGooglePlay className="text-2xl text-accent" />
                <h2 className="text-xl font-semibold text-textPrimary">
                  Join Google Play Early Access
                </h2>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="rounded-full p-2 text-textSecondary transition hover:bg-white/10 hover:text-textPrimary"
                aria-label="Close modal"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 max-h-[calc(80vh-200px)] space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-textPrimary">How to join testing:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-medium text-accent">
                      1
                    </div>
                    <div>
                      <p className="text-textSecondary">
                        First, join this Google Group to get access:
                      </p>
                      <a
                        href="https://groups.google.com/g/geofindertesters"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 group flex items-center justify-center gap-2 rounded-2xl border border-accent/60 bg-accent/20 px-6 py-3 font-medium text-accent transition hover:bg-accent/30 w-full sm:max-w-xs"
                      >
                        <FaPeopleGroup />
                        Join Google Group
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-medium text-accent">
                      2
                    </div>
                    <div>
                      <p className="text-textSecondary">
                        After joining the group, click below to become a tester:
                      </p>
                      <a
                        href="https://play.google.com/apps/testing/space.oof2510.geoguess"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 group flex items-center justify-center gap-2 rounded-2xl border border-accent/60 bg-accent/20 px-6 py-3 font-medium text-accent transition hover:bg-accent/30 w-full sm:max-w-xs"
                      >
                        <FaGooglePlay />
                        Join Google Play Early Access
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-textSecondary">
                    <span className="font-medium text-textPrimary">Note:</span> You must be signed in to the Google account you want to use for testing when clicking the links above.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-white/10 bg-surface/95 backdrop-blur-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={onClose}
                  type="button"
                  className="rounded-2xl border border-white/10 px-6 py-3 font-medium text-textSecondary transition hover:border-accent/50 hover:text-accent"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EarlyAccessModal;