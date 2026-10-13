import { useEffect, useEffectEvent, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  MoonStars,
  Pause,
  Play,
  Plus,
  Repeat,
  SpeakerSimpleHigh,
  Timer,
} from "@phosphor-icons/react";
import EnvironmentScene from "../components/EnvironmentScene";
import { useAudio } from "../context/AudioContext";
import { catOf, fmt, fmt2, seedBars, toTrack } from "../lib/sounds";
import styles from "../styles/SoundEnvironment.module.css";

const CIRC = 703.7; // 2πr for r = 112
const BAR_COUNT = 64;
const PRESETS = [15, 25, 45, 60];

function SoundEnvironment() {
  const { id } = useParams();
  const { state } = useLocation();
  const audio = useAudio();
  const { current, playing, pos, duration, loop, volume, savedSounds, timer } = audio;

  const soundId = Number(id);
  const [fetched, setFetched] = useState({ id: null, track: null, error: false });

  // Prefer what's already loaded, then router state, then a fetch (deep links).
  const savedName = savedSounds.find((s) => s.freesound_id === soundId)?.name;
  let track = null;
  if (current?.id === soundId) track = current;
  else if (state?.sound?.id === soundId) track = toTrack(state.sound, state.name);
  else if (fetched.id === soundId) track = fetched.track;
  // A saved sound shows the name the user gave it.
  if (track && savedName && !track.curated && track.name !== savedName) {
    track = { ...track, name: savedName };
  }

  const needsFetch = !track && fetched.id !== soundId;

  useEffect(() => {
    if (!needsFetch) return;
    let cancelled = false;
    fetch(`${import.meta.env.VITE_API_URL}/sounds/${soundId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setFetched({ id: soundId, track: toTrack(data), error: false });
      })
      .catch(() => {
        if (!cancelled) setFetched({ id: soundId, track: null, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [needsFetch, soundId]);

  // Entering an environment makes it the current sound.
  const openTrack = useEffectEvent((t) => audio.open(t));
  const trackId = track?.id;
  useEffect(() => {
    if (track) openTrack(track);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the sound changes
  }, [trackId]);

  if (!track) {
    const missing = fetched.id === soundId && fetched.error;
    return (
      <div className={styles.page}>
        <Link to="/" className={styles.back}>
          <ArrowLeft /> All environments
        </Link>
        <div className={styles.empty}>
          {missing ? (
            <>
              <h1 className={styles.emptyTitle}>Sound not found.</h1>
              <Link to="/" className={styles.btnPrimary}>
                Return home
              </Link>
            </>
          ) : (
            <p className={styles.muted}>Loading environment…</p>
          )}
        </div>
      </div>
    );
  }

  const cat = catOf(track);
  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && playing;
  const curPos = isCurrent ? pos : 0;
  const curDur = (isCurrent ? duration : 0) || track.duration;
  const ratio = curDur ? curPos / curDur : 0;
  const bars = seedBars(track.id, BAR_COUNT);

  const active = timer.started && timer.left > 0;
  const ringOffset = timer.started
    ? CIRC * (1 - timer.left / timer.total)
    : CIRC * (1 - Math.min(timer.total, 3600) / 3600);
  const timerTag = timer.done
    ? "Complete"
    : timer.running
      ? "Running"
      : timer.started
        ? "Paused"
        : "Off";
  const timerSub = !timer.started
    ? `${timer.total / 60} minutes`
    : timer.running && timer.endsAt
      ? `Stops at ${new Date(timer.endsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
      : "Paused";

  function seekKey(e) {
    if (e.key === "ArrowRight") audio.seek(Math.min(curDur, curPos + 5));
    else if (e.key === "ArrowLeft") audio.seek(Math.max(0, curPos - 5));
    else return;
    e.preventDefault();
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        <ArrowLeft /> All environments
      </Link>

      <section className={styles.hero}>
        <EnvironmentScene
          className={styles.canvas}
          sceneKey={track.sceneKey}
          tint={cat.tint}
          playing={isPlaying}
        />
        <div className={styles.scrim} />

        <div className={styles.heroTop}>
          <span className={styles.chip}>
            {track.curated ? "Immersive soundscape" : "Saved sound"} · {cat.label}
          </span>
          <span className={styles.chip}>
            <span className={`${styles.dot} ${isPlaying ? styles.dotLive : ""}`} />
            {isPlaying ? "Scene live" : "Scene resting — press play"}
          </span>
        </div>

        <div className={styles.heroBottom}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>{track.name}</h1>
            <div className={styles.heroMeta}>
              <span className={styles.recorded}>Recorded by {track.by}</span>
              {track.tags.slice(0, 4).map((t) => (
                <span key={t} className={styles.heroTag}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
          <button
            className={styles.bigPlay}
            onClick={() => audio.play(track)}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause weight="fill" /> : <Play weight="fill" />}
          </button>
        </div>
      </section>

      <div className={styles.panels}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Playback</h2>
            <span className={styles.timeLabel}>
              <span className={styles.timeNow}>{fmt(curPos)}</span> / {fmt(curDur)}
            </span>
          </div>

          <div
            className={styles.wave}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(curDur)}
            aria-valuenow={Math.round(curPos)}
            aria-valuetext={`${fmt(curPos)} of ${fmt(curDur)}`}
            onKeyDown={seekKey}
          >
            {bars.map((h, i) => (
              <span
                key={i}
                className={i / BAR_COUNT < ratio ? styles.barOn : styles.bar}
                style={{ height: `${h}%` }}
                onClick={() => audio.seek((i / BAR_COUNT) * curDur)}
              />
            ))}
          </div>

          <div className={styles.controls}>
            <button
              className={`${styles.loopChip} ${loop ? styles.on : ""}`}
              onClick={() => audio.setLoop((l) => !l)}
              aria-pressed={loop}
            >
              <Repeat /> {loop ? "Loop on" : "Loop off"}
            </button>
            <div className={styles.flex} />
            <label className={styles.volume}>
              <SpeakerSimpleHigh size={17} />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => audio.setVolume(Number(e.target.value))}
                aria-label="Volume"
              />
            </label>
          </div>

          <p className={styles.helper}>
            The scene comes alive while the sound plays and rests when it stops.
            Playback continues in the bar below as you browse.
          </p>
        </div>

        <div className={`${styles.panel} ${styles.timerPanel}`}>
          <div className={styles.ring}>
            <svg width="200" height="200" viewBox="0 0 260 260">
              <circle className={styles.ringTrack} cx="130" cy="130" r="112" />
              <circle
                className={styles.ringFill}
                cx="130"
                cy="130"
                r="112"
                strokeDasharray={CIRC}
                strokeDashoffset={ringOffset.toFixed(1)}
              />
            </svg>
            <div className={styles.ringCenter}>
              {timer.done ? (
                <>
                  <MoonStars size={30} className={styles.moon} />
                  <div className={styles.complete}>Session complete</div>
                </>
              ) : (
                <>
                  <div className={styles.digits}>
                    {fmt2(timer.started ? timer.left : timer.total)}
                  </div>
                  <div className={styles.ringSub}>{timerSub}</div>
                </>
              )}
            </div>
          </div>

          <div className={styles.timerSide}>
            <div className={styles.panelHead}>
              <h2 className={`${styles.panelTitle} ${styles.nowrap}`}>Sleep timer</h2>
              <span className={`${styles.status} ${timer.running ? styles.on : ""}`}>
                {timerTag}
              </span>
            </div>

            {!timer.started && (
              <div className={styles.idle}>
                <div className={styles.presets}>
                  <button
                    className={styles.stepBtn}
                    onClick={() => timer.adjust(-300)}
                    aria-label="Minus 5 minutes"
                  >
                    <Minus />
                  </button>
                  {PRESETS.map((m) => (
                    <button
                      key={m}
                      className={`${styles.preset} ${timer.total === m * 60 ? styles.presetOn : ""}`}
                      onClick={() => timer.setTotal(m * 60)}
                      aria-pressed={timer.total === m * 60}
                    >
                      {m}m
                    </button>
                  ))}
                  <button
                    className={styles.stepBtn}
                    onClick={() => timer.adjust(300)}
                    aria-label="Plus 5 minutes"
                  >
                    <Plus />
                  </button>
                </div>
                <button className={styles.timerBtn} onClick={timer.start}>
                  <Timer /> Start timer
                </button>
              </div>
            )}

            {active && (
              <div className={styles.activeBtns}>
                <button className={styles.timerBtn} onClick={timer.togglePause}>
                  {timer.running ? "Pause" : "Resume"}
                </button>
                <button className={styles.timerBtnSecondary} onClick={timer.cancel}>
                  Cancel
                </button>
              </div>
            )}

            {timer.done && (
              <button className={styles.timerBtnSecondary} onClick={timer.cancel}>
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoundEnvironment;
