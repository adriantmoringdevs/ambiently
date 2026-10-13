import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import AudioPlayer from "../components/AudioPlayer";
import SleepTimer from "../components/SleepTimer";
import Countdown from "../components/Countdown";
import useSleepTimer from "../hooks/useSleepTimer";
import styles from "../styles/SoundEnvironment.module.css";

function SoundEnvironment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const data = state?.sound;
  const previewUrl = data?.previews?.["preview-hq-mp3"];

  const audioRef = useRef(null);

  const onExpire = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const { timeRemaining, timerActive, startTimer, pauseTimer, cancelTimer } =
    useSleepTimer(onExpire);

  const handlePause = () => {
    if (timerActive) {
      pauseTimer();
    } else {
      startTimer(timeRemaining);
    }
  };

  if (!data)
    return (
      <>

        <main className={styles.emptyState}>
          <h1>Sound not found.</h1>

          <button className={styles.backButton} onClick={() => navigate("/")}>
            Return Home
          </button>
        </main>
      </>
    );

  return (
    <>

      <main className={styles.main}>
        <div className={styles.backgroundGlow}></div>

        <button className={styles.backButton} onClick={() => navigate("/")}>
          ← Back to Environments
        </button>

        <section className={styles.environmentCard}>
          <div className={styles.heroSection}>
            <span className={styles.badge}>Immersive Soundscape</span>

            <h1 className={styles.title}>{state?.name}</h1>

            <p className={styles.creator}>Created by {data.username}</p>

            <div className={styles.tags}>
              {data.tags?.slice(0, 6).map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <section className={styles.playerSection}>
            <h2 className={styles.sectionTitle}>Now Playing</h2>

            <AudioPlayer previewUrl={previewUrl} audioRef={audioRef} />
          </section>

          <section className={styles.timerSection}>
            <h2 className={styles.sectionTitle}>Sleep Timer</h2>

            {!timerActive && timeRemaining !== 0 && (
              <SleepTimer onStart={startTimer} />
            )}

            {timeRemaining === 0 && !timerActive ? (
              <div className={styles.countdownWrapper}>
                <div className={styles.sessionComplete}>
                  <div className={styles.sessionGlow}></div>
                  <span className={styles.sessionCheck}>✓</span>
                  <p className={styles.sessionLabel}>Session Complete</p>
                  <button
                    className={styles.dismissButton}
                    onClick={cancelTimer}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : timeRemaining !== null && (
              <div className={styles.countdownWrapper}>
                <Countdown
                  timeRemaining={timeRemaining}
                  timerActive={timerActive}
                  onPause={handlePause}
                  onCancel={cancelTimer}
                />
              </div>
            )}
          </section>
        </section>
      </main>
    </>
  );
}

export default SoundEnvironment;
