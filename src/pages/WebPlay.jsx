import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa6";
import {
  getImageWithCountry,
  matchGuess,
  normalizeCountry,
} from "../utils/geoApi.js";
import { startGameSession, submitScore } from "../utils/leaderboard.js";

const TOTAL_ROUNDS = 10;
  
function WebPlay() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [country, setCountry] = useState(null);
  const [countryCode, setCountryCode] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [coord, setCoord] = useState(null);
  const [guess, setGuess] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [incorrectGuesses, setIncorrectGuesses] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [gameSessionId, setGameSessionId] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [nextRound, setNextRound] = useState(null);
  const [prefetchTimestamp, setPrefetchTimestamp] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");

  const prefetchRequestId = useRef(0);
  const summaryTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const focusTimeoutRef = useRef(null);

  const queueInputFocus = (delay = 0) => {
    if (typeof window === "undefined") return;
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = window.setTimeout(() => {
      inputRef.current?.focus();
    }, delay);
  };

  useEffect(() => {
    const storedHighScore = localStorage.getItem("geofinder-high-score");
    if (storedHighScore) {
      const parsed = parseInt(storedHighScore, 10);
      if (!Number.isNaN(parsed)) {
        setHighScore(parsed);
      }
    }
  }, []);

  useEffect(() => {
    initializeGameSession();
    return () => {
      clearSummaryTimeout();
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!zoomOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setZoomOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomOpen]);

  useEffect(() => {
    if (image && !gameOver) {
      queueInputFocus(160);
    }
  }, [image, gameOver]);

  const clearSummaryTimeout = () => {
    if (summaryTimeoutRef.current) {
      clearTimeout(summaryTimeoutRef.current);
      summaryTimeoutRef.current = null;
    }
  };

  const prefetchNextRound = async () => {
    const requestId = ++prefetchRequestId.current;
    try {
      const result = await getImageWithCountry();
      if (result && requestId === prefetchRequestId.current) {
        setNextRound(result);
        setPrefetchTimestamp(Date.now());
      }
    } catch (error) {
      console.error("Prefetch failed", error);
    }
  };

  const hydrateRound = (roundData) => {
    setImage(roundData.image);
    setCoord(roundData.image?.coord ?? null);
    if (roundData.countryInfo) {
      setCountry(roundData.countryInfo.country);
      setCountryCode(roundData.countryInfo.countryCode);
      setDisplayName(roundData.countryInfo.displayName);
    } else {
      setCountry(null);
      setCountryCode(null);
      setDisplayName("Unknown");
    }
  };

  const startGame = async () => {
    clearSummaryTimeout();
    setShowSummary(false);
    setSummaryError("");
    setZoomOpen(false);

    const hasPrefetched = Boolean(nextRound);
    if (!hasPrefetched) {
      setLoading(true);
    }

    setImage(null);
    setGuess("");
    setGuessCount(0);
    setIncorrectGuesses([]);
    setFeedback("");
    setGameOver(false);
    setPrefetchTimestamp(null);

    try {
      let roundData = nextRound;
      if (roundData) {
        setNextRound(null);
        setPrefetchTimestamp(null);
      } else {
        roundData = await getImageWithCountry();
      }

      if (!roundData) {
        setFeedback("Could not fetch an image. Try again.");
        return;
      }

      hydrateRound(roundData);
      prefetchNextRound();
      queueInputFocus(120);
    } catch (error) {
      console.error("Failed to start round", error);
      setFeedback("Failed to start round. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const initializeGameSession = async () => {
    setLoading(true);
    try {
      const session = await startGameSession();
      if (session && session.gameSessionId) {
        setGameSessionId(session.gameSessionId);
        setOfflineMode(false);
      } else {
        setGameSessionId(null);
        setOfflineMode(true);
      }
      setNextRound(null);
      setPrefetchTimestamp(null);
      prefetchRequestId.current = 0;
      setRoundNumber(1);
      setRoundsPlayed(0);
      setCorrectAnswers(0);
      setCurrentScore(0);
      await startGame();
    } catch (error) {
      console.error("Error starting game session:", error);
      setGameSessionId(null);
      setOfflineMode(true);
      setNextRound(null);
      setPrefetchTimestamp(null);
      prefetchRequestId.current = 0;
      setRoundNumber(1);
      setRoundsPlayed(0);
      setCorrectAnswers(0);
      setCurrentScore(0);
      await startGame();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGuess = (event) => {
    if (event) {
      event.preventDefault();
    }

    const guessText = guess.trim();
    if (!guessText || !image) return;

    const normalizedGuess = normalizeCountry(guessText);
    const isCorrect = matchGuess(normalizedGuess, country, countryCode);
    const newGuessCount = guessCount + 1;
    setGuessCount(newGuessCount);

    if (isCorrect) {
      setFeedback(`✅ Correct! It was ${displayName}.`);
      setGameOver(true);
      setCorrectAnswers((prev) => prev + 1);

      let pointsEarned = 0;
      if (newGuessCount === 1) {
        pointsEarned = 3;
      } else if (newGuessCount === 2) {
        pointsEarned = 2;
      } else if (newGuessCount === 3) {
        pointsEarned = 1;
      }

      const newScore = currentScore + pointsEarned;
      setCurrentScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("geofinder-high-score", `${newScore}`);
      }
    } else {
      const updatedIncorrect = [...incorrectGuesses, guessText];
      setIncorrectGuesses(updatedIncorrect);
      if (newGuessCount >= 3) {
        const coordText = coord
          ? ` (${coord.lat.toFixed(4)}, ${coord.lon.toFixed(4)})`
          : "";
        setFeedback(`❌ Game over! It was ${displayName}${coordText}.`);
        setGameOver(true);
      } else {
        setFeedback(`❌ Not quite. Try again! (Guess ${newGuessCount}/3)`);
      }
    }

    setGuess("");

    if (!(isCorrect || newGuessCount >= 3)) {
      queueInputFocus(0);
    }

    if (isCorrect || newGuessCount >= 3) {
      setRoundsPlayed((prev) => Math.min(prev + 1, TOTAL_ROUNDS));
      if (roundNumber >= TOTAL_ROUNDS) {
        clearSummaryTimeout();
        summaryTimeoutRef.current = setTimeout(() => {
          setShowSummary(true);
        }, 2400);
      } else {
        setRoundNumber((prev) => Math.min(prev + 1, TOTAL_ROUNDS));
      }
    }
  };

  const continueGame = () => {
    clearSummaryTimeout();
    setShowSummary(false);
    setSummaryError("");
    setRoundNumber(1);
    setRoundsPlayed(0);
    setCorrectAnswers(0);
    setCurrentScore(0);
    setPrefetchTimestamp(null);
    initializeGameSession();
  };

  const startFreshGame = () => {
    clearSummaryTimeout();
    setShowSummary(false);
    setSummaryError("");
    setRoundNumber(1);
    setRoundsPlayed(0);
    setCorrectAnswers(0);
    setCurrentScore(0);
    setNextRound(null);
    setPrefetchTimestamp(null);
    prefetchRequestId.current = 0;
    startGame();
  };

  const handleSubmitScore = async () => {
    if (!gameSessionId || currentScore <= 0) {
      setShowSummary(false);
      startFreshGame();
      return;
    }

    setSubmittingScore(true);
    setSummaryError("");
    try {
      await submitScore(gameSessionId, currentScore, {
        correctAnswers,
        totalRounds: TOTAL_ROUNDS,
        roundsPlayed,
      });
      setShowSummary(false);
      setRoundNumber(1);
      setRoundsPlayed(0);
      setCorrectAnswers(0);
      setCurrentScore(0);
      initializeGameSession();
    } catch (error) {
      console.error("Score submission failed:", error);
      setSummaryError("Could not submit score. Please try again.");
    } finally {
      setSubmittingScore(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    setLeaderboardError("");
    try {
      const response = await fetch(
        "https://api.geo.oof2510.space/leaderboard/top",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await response.json();
      setLeaderboardData(data);
      setShowLeaderboard(true);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboardError("Could not load leaderboard. Please try again.");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const completedRounds = Math.min(roundsPlayed, TOTAL_ROUNDS);
  const progress = completedRounds / TOTAL_ROUNDS;
  const accuracy = completedRounds
    ? Math.round((correctAnswers / completedRounds) * 100)
    : 0;
  const displayedRound = Math.min(
    gameOver ? roundNumber : roundsPlayed + 1,
    TOTAL_ROUNDS,
  );
  const roundLabel = `Round ${displayedRound}/${TOTAL_ROUNDS}`;
  const guessReady = Boolean(guess.trim());

  return (
    <section className="flex flex-col gap-6 sm:gap-8 md:gap-10">
      <div className="flex flex-col gap-3 sm:gap-4">
        <p className="text-sm uppercase tracking-[0.4em] text-accent">
          Web Alpha
        </p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
          Play GeoFinder Online!
        </h1>
        <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-textSecondary">
          This web version mirrors the Android experience: ten rounds, three guesses per image, and leaderboard-ready scoring powered
          by the same <a href="https://github.com/oof2510/geoguess-api" target="_blank" rel="noopener noreferrer">GeoGuess API</a> as the Android app.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/play/ai"
            className="inline-flex items-center gap-2 rounded-2xl border border-accent/40 bg-accent/20 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/30"
          >
            Play vs AI beta
          </Link>
        </div>
      </div>

      <div className="relative grid gap-6 rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6 md:p-8 shadow-glow lg:grid-cols-[1.25fr_0.85fr]">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-textSecondary">
                {roundLabel}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-white">
                Score {currentScore}{" "}
                <span className="text-xs sm:text-sm font-normal text-textSecondary">
                  (High {highScore})
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-textSecondary">
              {offlineMode ? (
                <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-yellow-200">
                  Offline mode
                </span>
              ) : (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                  Connected to leaderboard
                </span>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-background/40">
            <div className="aspect-[4/3] sm:aspect-[16/9] w-full bg-black/40">
              <AnimatePresence mode="wait">
                {image ? (
                  <motion.img
                    key={image.url}
                    src={image.url}
                    alt="GeoFinder round"
                    className="h-full w-full cursor-zoom-in object-cover"
                    initial={{ opacity: 0.2, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    onClick={() => setZoomOpen(true)}
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    className="flex h-full w-full items-center justify-center text-textSecondary"
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {loading ? "Fetching Image…" : "Ready when you are"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="bg-background/80 px-4 py-3 text-right text-xs italic text-textSecondary/70">
              Images provided via Mapilliary
            </p>
          </div>

          {image && !gameOver && (
            <form
              className="flex flex-col gap-3 sm:gap-4"
              onSubmit={handleSubmitGuess}
            >
              <label
                className="text-sm font-medium text-textSecondary"
                htmlFor="guess-input"
              >
                Guess the country! (Guess {guessCount + 1}/3)
              </label>
              <input
                id="guess-input"
                ref={inputRef}
                value={guess}
                onChange={(event) => setGuess(event.target.value)}
                placeholder="Type a country name"
                autoComplete="off"
                className="w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-base text-white placeholder:text-textSecondary/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 touch-manipulation"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-2xl border border-emerald-500/30 bg-[#046C4E] px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/50 hover:bg-[#05805b] focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-70 w-full sm:w-auto touch-manipulation"
                  disabled={loading || !guessReady}
                >
                  Lock in guess
                </button>
              </div>
            </form>
          )}

          <AnimatePresence>
            {feedback && (
              <motion.div
                key={feedback}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="status"
                aria-live="polite"
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  feedback.startsWith("✅")
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                    : "border-red-500/40 bg-red-500/10 text-red-100"
                }`}
              >
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>

          {incorrectGuesses.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-background/60 px-4 py-3 text-sm text-textSecondary">
              <p className="font-semibold text-textPrimary">Previous guesses</p>
              <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                {incorrectGuesses.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-100"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {gameOver && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                type="button"
                onClick={startGame}
                className="rounded-2xl border border-accent/40 bg-accent/20 px-6 py-3 text-sm font-semibold text-accent transition hover:bg-accent/30 w-full sm:w-auto touch-manipulation"
              >
                Next round
              </button>
              <button
                type="button"
                onClick={initializeGameSession}
                className="rounded-2xl border border-white/10 bg-surface px-6 py-3 text-sm font-medium text-textSecondary transition hover:border-accent/40 hover:text-accent w-full sm:w-auto touch-manipulation"
              >
                Restart session
              </button>
            </div>
          )}
        </div>

        <aside className="flex h-full flex-col justify-between gap-5 sm:gap-6 rounded-2xl border border-white/5 bg-background/40 p-5 sm:p-6">
          <button
            type="button"
            onClick={fetchLeaderboard}
            disabled={leaderboardLoading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-accent/40 bg-accent/20 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-70 touch-manipulation"
          >
            <FaTrophy />
            {leaderboardLoading ? "Loading..." : "View Leaderboard"}
          </button>
          <div className="space-y-2 sm:space-y-3 text-sm text-textSecondary">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              How scoring works
            </h2>
            <ul className="space-y-2">
              <li>First guess correct · +3 points</li>
              <li>Second guess correct · +2 points</li>
              <li>Third guess correct · +1 point</li>
              <li>Miss all three · 0 points and round ends</li>
            </ul>
            <p className="pt-2 text-xs text-textSecondary/80">
              Leaderboard submissions are available whenever a Firebase App
              Check session is active. Offline mode keeps the loop playable even
              without credentials.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface/90 p-4 sm:p-5">
            <h3 className="text-sm sm:text-base font-semibold text-white">
              Session stats
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-textSecondary">
              <div>
                <dt className="text-xs uppercase tracking-[0.25em]">Correct</dt>
                <dd className="text-lg font-semibold text-white">
                  {correctAnswers}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.25em]">Played</dt>
                <dd className="text-lg font-semibold text-white">
                  {completedRounds}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.25em]">
                  Session ID
                </dt>
                <dd className="truncate text-xs text-textSecondary/70">
                  {gameSessionId ? gameSessionId.slice(0, 16) + "…" : "Offline"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.25em]">
                  Prefetched
                </dt>
                <dd className="text-lg font-semibold text-white">
                  {nextRound ? "1" : "0"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.25em]">
                  Accuracy
                </dt>
                <dd className="text-lg font-semibold text-white">
                  {accuracy}%
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.25em]">
                  Progress
                </dt>
                <dd className="text-lg font-semibold text-white">
                  {Math.round(progress * 100)}%
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={initializeGameSession}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm font-medium text-textSecondary transition hover:border-accent/40 hover:text-accent touch-manipulation"
            >
              Hard reset session
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/60 p-4 text-xs text-textSecondary/80">
            <p className="text-sm font-semibold text-textPrimary">
              Round pipeline
            </p>
            <p className="mt-2">
              {nextRound
                ? "Next image preloaded for a snappy round transition."
                : "Prefetching the next image in the background…"}
            </p>
            {prefetchTimestamp && (
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.25em] text-textSecondary/60">
                Cached at{" "}
                {new Date(prefetchTimestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </aside>
      </div>

      <div className="w-full rounded-3xl border border-white/10 bg-background/40 p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-textSecondary/70">
          <span>Session Progress</span>
          <span>
            {completedRounds}/{TOTAL_ROUNDS} rounds
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(progress, 1) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence>
        {zoomOpen && image && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
          >
            <motion.img
              src={image.url}
              alt="Expanded GeoFinder round"
              className="max-h-[90vh] w-full max-w-5xl rounded-2xl border border-white/10 object-contain"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-surface/95 p-6 sm:p-8 text-center shadow-glow"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                Game complete!
              </h2>
              <p className="mt-2 text-sm text-textSecondary">
                You nailed {correctAnswers} out of {TOTAL_ROUNDS} rounds for a
                final score of {currentScore}.
              </p>
              {currentScore > highScore && (
                <p className="mt-2 text-sm font-semibold text-emerald-200">
                  New personal best! 🎉
                </p>
              )}
              {summaryError && (
                <p className="mt-3 text-sm text-red-300">{summaryError}</p>
              )}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={continueGame}
                  className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 touch-manipulation"
                >
                  Continue (10 more)
                </button>
                <button
                  type="button"
                  onClick={startFreshGame}
                  className="rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm font-medium text-textSecondary transition hover:border-accent/40 hover:text-accent touch-manipulation"
                >
                  Start fresh
                </button>
                <button
                  type="button"
                  onClick={handleSubmitScore}
                  disabled={submittingScore}
                  className="rounded-2xl border border-accent/50 bg-accent/20 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-70 touch-manipulation"
                >
                  {submittingScore ? "Submitting…" : "Submit score"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-surface/95 p-6 sm:p-8 shadow-glow"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-accent">
                  Leaderboard
                </h2>
              </div>

              {leaderboardLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent mb-3"></div>
                  <p className="text-textSecondary">Loading scores...</p>
                </div>
              ) : leaderboardError ? (
                <div className="text-center py-10">
                  <p className="text-white text-lg mb-2">
                    Failed to load leaderboard
                  </p>
                  <p className="text-textSecondary text-sm">
                    {leaderboardError}
                  </p>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-white text-lg mb-2">
                    No scores available yet.
                  </p>
                  <p className="text-textSecondary text-sm">
                    Be the first to play and set a high score!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leaderboardData.map((entry, index) => (
                    <div
                      key={`${entry.rank}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-base font-bold text-emerald-400 min-w-[50px]">
                        #{entry.rank}
                      </span>
                      <span className="text-base font-bold text-white flex-1 text-center">
                        {entry.score} pts
                      </span>
                      <span className="text-xs text-textSecondary min-w-[80px] text-right">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowLeaderboard(false)}
                  className="w-3/5 rounded-2xl border border-red-500/50 bg-red-500/20 px-4 py-3 text-base font-semibold text-red-200 transition hover:bg-red-500/30 touch-manipulation"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default WebPlay;