import { useState, useEffect, useCallback, useRef } from "react";

export function useTimer({
  duration,
  onWarning,
  onEnd,
  warningThresholds = [300, 120, 30],
}) {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const triggeredWarnings = useRef(new Set());

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          const next = prev - 1;

          // Check warning thresholds
          for (const threshold of warningThresholds) {
            if (
              next === threshold &&
              !triggeredWarnings.current.has(threshold)
            ) {
              triggeredWarnings.current.add(threshold);
              onWarning?.(threshold);
            }
          }

          if (next <= 0) {
            onEnd?.();
            setIsRunning(false);
            setIsPaused(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, onWarning, onEnd, warningThresholds]);

  const formatTime = useCallback((secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  const progress = ((duration - remaining) / duration) * 100;
  const isWarning = remaining <= 300;
  const isCritical = remaining <= 30;

  return {
    remaining,
    formatted: formatTime(remaining),
    progress,
    isRunning,
    isPaused,
    isWarning,
    isCritical,
    start,
    pause,
    resume,
    stop,
  };
}
