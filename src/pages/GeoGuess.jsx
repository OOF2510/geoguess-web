import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaAndroid,
  FaApple,
  FaArrowUpRightFromSquare,
  FaDesktop,
  FaGithub,
  FaMap,
  FaGlobe,
} from "react-icons/fa6";
import { PiRankingFill } from "react-icons/pi";
import SectionHeading from "../components/SectionHeading.jsx";
import ReleaseNotesModal from "../components/ReleaseNotesModal.jsx";

const features = [
  {
    title: "Fun, engaging rounds",
    description:
      "Each game consists of 10 rounds of images from random countries, you get three guesses for each image, and can continue your game for 10 more rounds afterwards.",
  },
  {
    title: "Street-level immersion",
    description: (
      <>
        Curated Mapillary imagery served from my{" "}
        <a
          className="text-accent underline decoration-accent/40 underline-offset-4"
          href="https://github.com/oof2510/geoguess-api"
          target="_blank"
          rel="noreferrer"
        >
          GeoGuess API
        </a>{" "}
        with OSM-powered country data.
      </>
    ),
  },
  {
    title: "Secure leaderboards",
    description:
      "Climb global leaderboards to see how you stack up against other explorers while we keep every match fair.",
  },
];

const techStack = {
  frontend: [
    "React Native",
    "TypeScript",
    "React Navigation",
    "Gesture Handler",
    "Image Zoom Viewer",
  ],
  backend: [
    "Node.js + Express",
    "MongoDB",
    "Mapillary ingestion pipeline",
    "OpenStreetMap Nominatim",
    "Firebase App Check",
  ],
  tooling: [
    "Metro bundler",
    "GitHub Actions",
    "Prettier + ESLint",
    "Android build tooling",
  ],
};

const roadmapItems = [
  "Play store release",
  "API improvements",
  "1v1 multiplayer",
];

const screenshots = [
  "/screenshots/geofinder-1.webp",
  "/screenshots/geofinder-2.webp",
  "/screenshots/geofinder-3.webp",
  "/screenshots/geofinder-4.webp",
];

function GeoGuess() {
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [releaseData, setReleaseData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreenshot((current) => (current + 1) % screenshots.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadAPK = async () => {
    try {
      const response = await fetch(
        "https://api.github.com/repos/oof2510/geoguessapp/releases/latest",
      );
      const data = await response.json();
      const apkAsset = data.assets.find((asset) => asset.name.endsWith(".apk"));
      if (apkAsset) {
        // Start the download
        window.open(apkAsset.browser_download_url);
        // Store release data and show modal
        setReleaseData(data);
        setIsModalOpen(true);
      }
    } catch (error) {
      // Fallback to releases page if API fails
      window.open(
        "https://github.com/oof2510/geoguessapp/releases/latest",
        "_blank",
      );
    }
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-16 md:gap-24">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accentMuted/30 via-surface/80 to-background p-6 sm:p-8 md:p-10 shadow-glow">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_10%,rgba(56,139,253,0.25),transparent_55%)]" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6 lg:order-1">
            <p className="text-sm uppercase tracking-[0.45em] text-accent">
              GeoFinder
            </p>
            <motion.div
              className="w-full rounded-3xl border border-white/10 bg-white/5 p-3 shadow-inner lg:hidden max-w-sm mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative w-full overflow-hidden rounded-2xl pt-[160%]">
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={screenshots[activeScreenshot]}
                    src={screenshots[activeScreenshot]}
                    alt="GeoFinder gameplay"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0.1, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </AnimatePresence>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {screenshots.map((_, index) => (
                    <button
                      type="button"
                      key={screenshots[index]}
                      onClick={() => setActiveScreenshot(index)}
                      className={`h-2 w-2 rounded-full transition ${index === activeScreenshot ? "bg-accent shadow-[0_0_12px_rgba(56,139,253,0.7)]" : "bg-white/30 hover:bg-white/60"}`}
                      aria-label={`Show screenshot ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
              Guess the world. Flex the brain.
            </h1>
            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-textSecondary">
              GeoFinder, a mobile and web geography guessing adventure that
              blends fun, engaging gameplay with global imagery. Built with
              React Native and powered by my{" "}
              <a
                className="text-accent underline decoration-accent/40 underline-offset-4"
                href="https://github.com/oof2510/geoguess-api"
                target="_blank"
                rel="noreferrer"
              >
                GeoGuess API
              </a>{" "}
              to provide diverse street view images from around the world via
              Mapillary.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={handleDownloadAPK}
                  type="button"
                  className="group flex items-center justify-center gap-3 rounded-2xl border border-accent/60 bg-accent/20 px-6 py-3 font-medium text-accent transition hover:bg-accent/30 cursor-pointer w-full sm:w-auto"
                >
                  <FaAndroid />
                  Download Latest APK
                </button>
                <a
                  href="https://github.com/oof2510/geoguessapp"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 py-3 font-medium text-textSecondary transition hover:border-accent/50 hover:text-accent w-full sm:w-auto"
                >
                  <FaGithub />
                  View source
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[0.7rem] sm:text-sm text-textSecondary flex items-center gap-1 flex-wrap leading-tight">
                  On <FaApple className="inline text-white text-xs" /> or{" "}
                  <FaDesktop className="inline text-white text-xs" />? Try it
                  here on the site!
                </p>
                <a
                  href="/play"
                  className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 py-3 font-medium text-textSecondary transition hover:border-accent/50 hover:text-accent w-full sm:w-auto"
                >
                  <FaGlobe />
                  Play in Browser
                </a>
              </div>
            </div>
          </div>
          <motion.div
            className="hidden lg:block flex-1 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-inner lg:order-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative w-full overflow-hidden rounded-2xl pt-[160%]">
              <AnimatePresence initial={false} mode="wait">
                <motion.img
                  key={screenshots[activeScreenshot]}
                  src={screenshots[activeScreenshot]}
                  alt="GeoFinder gameplay"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0.1, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </AnimatePresence>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {screenshots.map((_, index) => (
                  <button
                    type="button"
                    key={screenshots[index]}
                    onClick={() => setActiveScreenshot(index)}
                    className={`h-2 w-2 rounded-full transition ${index === activeScreenshot ? "bg-accent shadow-[0_0_12px_rgba(56,139,253,0.7)]" : "bg-white/30 hover:bg-white/60"}`}
                    aria-label={`Show screenshot ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Gameplay loop"
          title="Every game is a world tour"
          description="Made to be fun, competitive, and with infinite replayability."
        />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-surface/70 p-5 sm:p-6 shadow-lg"
              whileHover={{ y: -8 }}
            >
              <h3 className="text-lg sm:text-xl font-semibold text-textPrimary">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-[1.4fr_1fr]">
        <motion.div
          className="rounded-3xl border border-white/10 bg-surface/80 p-6 sm:p-8 shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading
            eyebrow="Under the hood"
            title="Tech that keeps the globe spinning"
            description="From typed React Native screens to hardened API infra, everything snaps together for fast gameplay and trustworthy scoring."
          />
          <div className="mt-6 sm:mt-8 grid gap-5 sm:gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm uppercase tracking-[0.3em] text-accent">
                Frontend
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-textSecondary">
                {techStack.frontend.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-[0.3em] text-accent">
                Backend
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-textSecondary">
                {techStack.backend.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm uppercase tracking-[0.3em] text-accent">
                Tooling & Ops
              </h3>
              <ul className="mt-3 flex flex-wrap gap-3 text-sm text-textSecondary">
                {techStack.tooling.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-accent/10 via-accentMuted/10 to-transparent p-6 sm:p-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-textPrimary">
            Why it's special
          </h3>
          <div className="space-y-4 text-sm text-textSecondary">
            <p className="flex items-start gap-3">
              <PiRankingFill className="mt-1 text-lg text-accent" />
              Completely free, no ads, no paywalls, no gimmicks. Just a fun game
              to play and compete on the global leaderboard.
            </p>
            <p className="flex items-start gap-3">
              <PiRankingFill className="mt-1 text-lg text-accent" />
              <span>
                Global leaderboard tuned for fairness with Firebase App Check
                and validation against my{" "}
                <a
                  className="text-accent underline decoration-accent/40 underline-offset-4"
                  href="https://github.com/oof2510/geoguess-api"
                  target="_blank"
                  rel="noreferrer"
                >
                  GeoGuess API
                </a>
                .
              </span>
            </p>
            <p className="flex items-start gap-3">
              <FaMap className="mt-1 text-lg text-accent" />
              <span>
                Custom{" "}
                <a
                  className="text-accent underline decoration-accent/40 underline-offset-4"
                  href="https://github.com/oof2510/geoguess-api"
                  target="_blank"
                  rel="noreferrer"
                >
                  GeoGuess API
                </a>{" "}
                feeds diverse regions and countries with country metadata so
                each image is a unique challenge.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <FaAndroid className="mt-1 text-lg text-accent" />
              Optimized Android builds, local caching, and offline resilience to
              keep sessions smooth even on mid-tier devices.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-surface/70 p-6 sm:p-8 shadow-lg">
        <SectionHeading
          eyebrow="Roadmap"
          title="What's next"
          description="See what's in the works."
        />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {roadmapItems.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 text-sm text-textSecondary"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <ReleaseNotesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        releaseData={releaseData}
      />
    </div>
  );
}

export default GeoGuess;
