import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useUser } from "./UserContext";
import useSleepTimer from "../hooks/useSleepTimer";

const SoundsContext = createContext();

const LAST_PLAYED_KEY = "ambient:lastPlayed";

function readLastPlayed() {
  try {
    const v = localStorage.getItem(LAST_PLAYED_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

export function AudioProvider({ children }) {
  const [savedSounds, setSavedSounds] = useState([]);
  const { user } = useUser()

  // Shared playback state: one <audio> element drives the mini-player,
  // the Environment page and Search previews.
  const audioRef = useRef(null);
  const currentRef = useRef(null);
  const [current, setCurrent] = useState(null);
  const [lastPlayed, setLastPlayed] = useState(readLastPlayed);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(true);
  const [volume, setVolume] = useState(70);

  const timer = useSleepTimer(() => audioRef.current?.pause());

  // Reset saved sounds whenever the signed-in user changes.
  const [savedFor, setSavedFor] = useState(null);
  if (user !== savedFor) {
    setSavedFor(user);
    setSavedSounds(user?.sounds || []);
  }

  useEffect(() => {
    audioRef.current.loop = loop;
  }, [loop]);

  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  const addSound = (freesound_id, name) => {
    return fetch(`${import.meta.env.VITE_API_URL}/sounds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ freesound_id, name }),
    })
    .then((r) => {
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    })
    .then(newSound => {
      setSavedSounds(prev => [...prev, newSound])
      return newSound
    })
  }

  function resume() {
    const audio = audioRef.current;
    if (!currentRef.current || !audio.src) return;
    if (audio.ended || (duration && audio.currentTime >= duration)) audio.currentTime = 0;
    audio.play().catch((err) => console.log("Playback prevented or failed:", err));
  }

  function pause() {
    audioRef.current.pause();
  }

  function load(track, autoplay) {
    const audio = audioRef.current;
    currentRef.current = track;
    setCurrent(track);
    setPos(0);
    setDuration(track.duration || 0);
    if (track.curated) {
      setLastPlayed(track.id);
      try {
        localStorage.setItem(LAST_PLAYED_KEY, String(track.id));
      } catch {
        // storage unavailable — last played just won't persist
      }
    }
    audio.src = track.previewUrl || "";
    if (autoplay && track.previewUrl) resume();
  }

  // Play a track, or toggle it if it's already the current one.
  function play(track) {
    if (currentRef.current?.id === track.id) toggle();
    else load(track, true);
  }

  // Make a track current without changing whether audio is playing.
  function open(track) {
    if (currentRef.current?.id === track.id) return;
    load(track, !audioRef.current.paused);
  }

  function toggle() {
    if (audioRef.current.paused) resume();
    else pause();
  }

  function seek(seconds) {
    const audio = audioRef.current;
    if (!currentRef.current) return;
    audio.currentTime = seconds;
    setPos(seconds);
  }

  const sleepTimer = {
    ...timer,
    // Starting the timer also starts playback.
    start() {
      timer.start();
      if (audioRef.current.paused) resume();
    },
  };

  return (
    <SoundsContext.Provider
      value={{
        savedSounds,
        addSound,
        current,
        lastPlayed,
        playing,
        pos,
        duration,
        loop,
        volume,
        play,
        open,
        toggle,
        seek,
        setLoop,
        setVolume,
        timer: sleepTimer,
      }}
    >
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
        }}
      />
      {children}
    </SoundsContext.Provider>
  );
}

export function useAudio() {
  return useContext(SoundsContext);
}
