import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGithub } from "react-icons/fa";

function ReleaseNotesModal({ isOpen, onClose, releaseData }) {
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

  if (!releaseData) return null;

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
                <FaGithub className="text-2xl text-accent" />
                <div>
                  <h2 className="text-xl font-semibold text-textPrimary">
                    {releaseData.name || releaseData.tag_name}
                  </h2>
                  <p className="text-sm text-textSecondary">
                    {new Date(releaseData.published_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
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
            <div className="overflow-y-auto p-6 max-h-[calc(80vh-120px)]">
              <div className="prose prose-invert max-w-none">
                {releaseData.body ? (
                  <div className="space-y-4 text-textSecondary whitespace-pre-wrap">
                    {releaseData.body.split("\n").map((line, index) => {
                      // Handle markdown headers
                      if (line.startsWith("## ")) {
                        return (
                          <h3
                            key={index}
                            className="text-lg font-semibold text-textPrimary mt-6 mb-2"
                          >
                            {line.replace("## ", "")}
                          </h3>
                        );
                      }
                      if (line.startsWith("# ")) {
                        return (
                          <h2
                            key={index}
                            className="text-xl font-semibold text-textPrimary mt-6 mb-2"
                          >
                            {line.replace("# ", "")}
                          </h2>
                        );
                      }
                      // Handle list items
                      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                        return (
                          <li
                            key={index}
                            className="flex items-start gap-2 ml-4"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                            <span>{line.trim().substring(2)}</span>
                          </li>
                        );
                      }
                      // Empty lines
                      if (line.trim() === "") {
                        return <div key={index} className="h-2" />;
                      }
                      // Regular paragraphs
                      return (
                        <p key={index} className="leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-textSecondary">
                    No release notes available for this version.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-white/10 bg-surface/95 backdrop-blur-sm p-6">
              <a
                href={releaseData.html_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-2xl border border-accent/60 bg-accent/20 px-6 py-3 font-medium text-accent transition hover:bg-accent/30"
              >
                <FaGithub />
                View on GitHub
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReleaseNotesModal;
