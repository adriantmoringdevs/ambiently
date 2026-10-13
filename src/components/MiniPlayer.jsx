import { useLocation, useNavigate } from "react-router-dom";
import { Pause, Play, Repeat, Timer } from "@phosphor-icons/react";
import { useAudio } from "../context/AudioContext";
import { catOf, fmt, fmt2 } from "../lib/sounds";
import styles from "../styles/MiniPlayer.module.css";

function MiniPlayer() {
  const { current, playing, pos, duration, loop, toggle, setLoop, timer } = useAudio();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (!current || pathname === "/login") return null;

  const cat = catOf(current);
  const Icon = cat.icon;
  const progress = duration ? Math.min(100, (pos / duration) * 100) : 0;
  const active = timer.started && timer.left > 0;

  const timerLabel = active
    ? fmt2(timer.left) + (timer.running ? "" : " ‖")
    : timer.done
      ? "Done"
      : "Timer";

  const goEnv = () =>
    navigate(`/sound/${current.id}`, {
      state: { sound: current.raw, name: current.name },
    });

  return (
    <div className={styles.bar}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.row}>
        <button
          className={styles.play}
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
        </button>

        <span className={styles.tint} style={{ background: cat.tint }}>
          <Icon />
        </span>

        <button className={styles.meta} onClick={goEnv}>
          <span className={styles.name}>{current.name}</span>
          <span className={styles.by}>by {current.by}</span>
        </button>

        <span className={styles.time}>
          {fmt(pos)} / {fmt(duration)}
        </span>

        <div className={styles.spacer} />

        <button
          className={`${styles.timer} ${active ? styles.on : ""}`}
          onClick={goEnv}
          aria-label="Sleep timer"
        >
          <Timer size={15} />
          {timerLabel}
        </button>

        <button
          className={`${styles.loop} ${loop ? styles.on : ""}`}
          onClick={() => setLoop((l) => !l)}
          aria-label={loop ? "Loop on" : "Loop off"}
          aria-pressed={loop}
        >
          <Repeat size={17} />
        </button>
      </div>
    </div>
  );
}

export default MiniPlayer;
