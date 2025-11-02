import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaRobot,
  FaRotateRight,
  FaUser,
} from "react-icons/fa6";
import { startAiMatch, submitAiGuess } from "../utils/aiDuel.js";
import { normalizeCountry } from "../utils/geoApi.js";

const formatCountry = (value) => {
  if (!value) return "Unknown";
  const normalized = normalizeCountry(value);
  if (!normalized) return value;
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatConfidence = (confidence) => {
  if (typeof confidence !== "number") return "--";
  return `${Math.round(confidence * 100)}%`;
};

const formatCoordinates = (coords) => {
  if (!coords || typeof coords.lat !== "number" || typeof coords.lon !== "number") {
    return null;
  }
  return `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`;
};

function AiDuel() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [matchId, setMatchId] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);
  const [queuedRound, setQueuedRound] = useState(null);
  const [totalRounds, setTotalRounds] = useState(0);
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [status, setStatus] = useState("in-progress");
  const [guess, setGuess] = useState("");
  const [latestResult, setLatestResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [zoomOpen, setZoomOpen] = useState(false);

  const resetState = useCallback(() => {
    setGuess("");
    setScores({ player: 0, ai: 0 });
    setQueuedRound(null);
    setLatestResult(null);
    setHistory([]);
    setStatus("in-progress");
    setErrorMessage("");
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    resetState();
    try {
      const response = await startAiMatch();
      if (!response?.matchId || !response.round) {
        throw new Error("Match could not be created");
      }

      setMatchId(response.matchId);
      setCurrentRound(response.round);
      setTotalRounds(response.totalRounds || 0);
      setScores(response.scores || { player: 0, ai: 0 });
      setStatus(response.status || "in-progress");
    } catch (error) {
      console.error("Failed to start AI duel", error);
      setErrorMessage(
        "We couldn't start a match right now. Double-check your network connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [resetState]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const roundLabel = useMemo(() => {
    if (!currentRound) return "";
    return `Round ${currentRound.roundIndex + 1} / ${totalRounds || 0}`;
  }, [currentRound, totalRounds]);

  const canSubmitGuess =
    !loading &&
    !submitting &&
    status === "in-progress" &&
    currentRound &&
    !latestResult;

  const guessReady = Boolean(guess.trim());

  const handleSubmitGuess = async (event) => {
    event.preventDefault();
    if (!canSubmitGuess) return;

    const cleanedGuess = guess.trim();
    if (!cleanedGuess) {
      setErrorMessage("Enter a country before submitting your guess.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    try {
      const response = await submitAiGuess(
        matchId,
        currentRound.roundIndex,
        cleanedGuess,
      );
      setLatestResult(response);
      setScores(response.scores || scores);
      setStatus(response.status || "in-progress");
      setHistory(response.history || []);
      setQueuedRound(response.nextRound || null);
      setGuess("");
    } catch (error) {
      console.error("Failed to submit AI guess", error);
      const code = error?.code;
      const payload = error?.payload || {};

      if (code === "round_out_of_sync" && payload.expectedRound) {
        setCurrentRound(payload.expectedRound);
        setQueuedRound(null);
        setLatestResult(null);
        setGuess("");
        setErrorMessage("We synced you to the latest round. Try guessing again!");
      } else if (code === "match_completed") {
        if (payload.scores) {
          setScores(payload.scores);
        }
        if (payload.history) {
          setHistory(payload.history);
        }
        setStatus("completed");
        setLatestResult(null);
        setQueuedRound(null);
        setErrorMessage("This match already wrapped up. Start a new duel!");
      } else if (code === "missing_app_check_token") {
        setErrorMessage(
          "App Check verification failed. Refresh the page and confirm Firebase App Check is configured.",
        );
      } else {
        setErrorMessage("Something went wrong submitting your guess. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextRound = () => {
    if (!queuedRound) return;
    setCurrentRound(queuedRound);
    setQueuedRound(null);
    setLatestResult(null);
    setGuess("");
    setErrorMessage("");
  };

  const handleRematch = () => {
    bootstrap();
  };

  const completed = status === "completed";
  const awaitingNextRound = status === "in-progress" && latestResult && queuedRound;
  const coordinates = latestResult?.coordinates || null;
  const coordinateText = formatCoordinates(coordinates);

  return (
    <section className="flex flex-col gap-6 sm:gap-8 md:gap-10">
      <div className="flex flex-col gap-3 sm:gap-4">
        <p className="text-sm uppercase tracking-[0.4em] text-accent">AI Duel</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
          Challenge GeoFinder's AI opponent
        </h1>
        <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-textSecondary">
          Play a five-round match against GeoAI, powered by <code className="text-xs bg-background/60 px-1.5 py-0.5 rounded border border-white/10">mistral-small-3.2-24b-instruct</code>: guess the country from the image,
          then see how the AI model responded, complete with reasoning and confidence ratings.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/play"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-background/60 px-4 py-2 text-sm font-medium text-textSecondary transition hover:border-accent/40 hover:text-accent touch-manipulation"
          >
            <FaArrowLeft />
            Back to solo mode
          </Link>
          <button
            type="button"
            onClick={handleRematch}
            className="inline-flex items-center gap-2 rounded-2xl border border-accent/40 bg-accent/20 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/30 touch-manipulation"
            disabled={loading}
          >
            <FaRotateRight />
            {loading ? "Starting match…" : completed ? "Start new match" : "Restart"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6 md:p-8 shadow-glow lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-textSecondary">{roundLabel}</p>
              <p className="text-xl sm:text-2xl font-semibold text-white">
                Match score
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-background/60 px-4 py-2 text-xs sm:text-sm text-textSecondary">
              <span className="flex items-center gap-2 text-white">
                <FaUser className="text-emerald-300" /> {scores.player}
              </span>
              <span className="text-textSecondary">vs</span>
              <span className="flex items-center gap-2 text-white">
                <FaRobot className="text-accent" /> {scores.ai}
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-background/40">
            <div className="aspect-[4/3] sm:aspect-[16/9] w-full bg-black/40">
              <AnimatePresence mode="wait">
                {currentRound?.imageUrl ? (
                  <motion.img
                    key={currentRound.imageUrl}
                    src={currentRound.imageUrl}
                    alt="AI duel round"
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
                    {loading ? "Loading round…" : completed ? "Match finished" : "Ready when you are"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="bg-background/80 px-4 py-3 text-right text-xs italic text-textSecondary/70">
              Images provided via Mapilliary
            </p>
          </div>

          {status === "in-progress" && currentRound && !latestResult && (
            <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmitGuess}>
              <label className="text-sm font-medium text-textSecondary" htmlFor="ai-guess-input">
                Guess the country to lock in your round
              </label>
              <input
                id="ai-guess-input"
                value={guess}
                onChange={(event) => setGuess(event.target.value)}
                placeholder="e.g. Japan"
                autoComplete="off"
                className="w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-base text-white placeholder:text-textSecondary/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-2xl border border-emerald-500/30 bg-[#046C4E] px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/50 hover:bg-[#05805b] focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-70 w-full sm:w-auto touch-manipulation"
                  disabled={!guessReady || !canSubmitGuess}
                >
                  {submitting ? "Submitting…" : "Lock in guess"}
                </button>
              </div>
            </form>
          )}

          {awaitingNextRound && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleNextRound}
                className="rounded-2xl border border-accent/40 bg-accent/20 px-6 py-3 text-sm font-semibold text-accent transition hover:bg-accent/30 touch-manipulation"
              >
                <FaArrowRight />
                Next round
              </button>
            </div>
          )}

          {completed && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Match complete! Want a rematch?
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="rounded-2xl border border-white/10 bg-background/60 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-white">Round insights</h2>
            {latestResult ? (
              <div className="mt-4 space-y-3 text-sm text-textSecondary">
                <p>
                  <span className="font-semibold text-textPrimary">Correct country:</span>{" "}
                  {formatCountry(latestResult.correctCountry?.name)}
                  {latestResult.correctCountry?.code
                    ? ` (${latestResult.correctCountry.code})`
                    : ""}
                </p>
                {coordinateText && (
                  <p>
                    <span className="font-semibold text-textPrimary">Coordinates:</span>{" "}
                    {coordinateText}
                  </p>
                )}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-100">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Your guess</p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {latestResult.playerResult?.guess || "No guess"}
                  </p>
                  <p className="text-xs text-emerald-200/80">
                    {latestResult.playerResult?.isCorrect ? "Correct" : "Incorrect"}
                  </p>
                </div>
                {latestResult.aiResult && (
                  <div className="rounded-2xl border border-accent/40 bg-accent/15 p-3 text-accent">
                    <p className="text-xs uppercase tracking-[0.3em] text-accent/80">AI guess</p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {formatCountry(latestResult.aiResult.countryName)}
                    </p>
                    <p className="text-xs text-accent/80">
                      Confidence {formatConfidence(latestResult.aiResult.confidence)}
                    </p>
                    <p className="mt-2 text-sm text-accent/90">
                      {latestResult.aiResult.explanation || "No explanation provided."}
                    </p>
                    {latestResult.aiResult.fallbackReason && (
                      <p className="mt-2 text-xs text-accent/70">
                        Fallback reason: {latestResult.aiResult.fallbackReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-textSecondary">
                Submit a guess to see if you can beat the AI!
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-white">Match history</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-textSecondary">
                Results will appear here after you complete your first round.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {history.map((round) => {
                  const playerCorrect = round.player?.isCorrect;
                  const aiCorrect = round.ai?.isCorrect;
                  return (
                    <div
                      key={round.roundIndex}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-textSecondary">
                        <span className="font-semibold text-textPrimary">
                          Round {round.roundIndex + 1}
                        </span>
                        <span>
                          {formatCountry(round.correctCountry?.name)}
                          {round.correctCountry?.code ? ` (${round.correctCountry.code})` : ""}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div className={`rounded-xl border px-3 py-2 ${
                          playerCorrect
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                            : "border-red-500/40 bg-red-500/10 text-red-100"
                        }`}>
                          <p className="text-xs uppercase tracking-[0.3em]">You</p>
                          <p className="text-sm font-semibold">
                            {round.player?.guess || "No guess"}
                          </p>
                        </div>
                        <div className={`rounded-xl border px-3 py-2 ${
                          aiCorrect
                            ? "border-accent/40 bg-accent/20 text-accent"
                            : "border-white/10 bg-white/5 text-textSecondary"
                        }`}>
                          <p className="text-xs uppercase tracking-[0.3em]">AI</p>
                          <p className="text-sm font-semibold text-white">
                            {round.ai ? formatCountry(round.ai.countryName) : "No guess"}
                          </p>
                          {round.ai && (
                            <p className="text-xs text-accent/70">
                              Confidence {formatConfidence(round.ai.confidence)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {zoomOpen && currentRound?.imageUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 sm:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
          >
            <motion.img
              key={currentRound.imageUrl}
              src={currentRound.imageUrl}
              alt="Zoomed AI duel round"
              className="max-h-[90vh] w-full max-w-5xl rounded-3xl object-contain"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default AiDuel;