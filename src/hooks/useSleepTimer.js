import { useState, useEffect, useRef } from "react";

const MIN_SECONDS = 5 * 60;
const MAX_SECONDS = 120 * 60;

const clamp = (s) => Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, s));

// Countdown sleep timer. `total` is the chosen length, `left` the seconds remaining.
// The remaining time is derived from a wall-clock deadline so it stays accurate
// even when a background tab throttles the interval.
function useSleepTimer(onExpire, initialSeconds = 25 * 60) {
  const [total, setTotalState] = useState(initialSeconds);
  const [left, setLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [endsAt, setEndsAt] = useState(null);

  const leftRef = useRef(initialSeconds);
  const endsAtRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  function syncLeft(seconds) {
    leftRef.current = seconds;
    setLeft(seconds);
  }

  function syncEndsAt(ms) {
    endsAtRef.current = ms;
    setEndsAt(ms);
  }

  function setTotal(seconds) {
    const t = clamp(seconds);
    setTotalState(t);
    syncLeft(t);
  }

  function adjust(deltaSeconds) {
    setTotal(total + deltaSeconds);
  }

  function start() {
    setStarted(true);
    setRunning(true);
    syncLeft(total);
    syncEndsAt(Date.now() + total * 1000);
  }

  function togglePause() {
    if (running) {
      setRunning(false);
      syncEndsAt(null);
    } else if (leftRef.current > 0) {
      setRunning(true);
      syncEndsAt(Date.now() + leftRef.current * 1000);
    }
  }

  function cancel() {
    setStarted(false);
    setRunning(false);
    syncLeft(total);
    syncEndsAt(null);
  }

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const next = Math.max(0, Math.round((endsAtRef.current - Date.now()) / 1000));
      if (next === leftRef.current) return;
      syncLeft(next);
      if (next === 0) {
        setRunning(false);
        syncEndsAt(null);
        onExpireRef.current?.();
      }
    }, 250);

    return () => clearInterval(id);
  }, [running]);

  return {
    total,
    left,
    running,
    started,
    done: started && left === 0,
    endsAt,
    setTotal,
    adjust,
    start,
    togglePause,
    cancel,
  };
}

export default useSleepTimer;
