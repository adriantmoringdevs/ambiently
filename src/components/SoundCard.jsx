import { useNavigate } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { useAudio } from "../context/AudioContext";
import useFetchedAudio from "../hooks/fetchAudio";
import { catOf, fmt, toTrack } from "../lib/sounds";
import styles from "../styles/SoundCard.module.css";

function useOpenEnvironment() {
  const navigate = useNavigate();
  return (track) =>
    navigate(`/sound/${track.id}`, {
      state: { sound: track.raw, name: track.name },
    });
}

// Curated environment tile. `featured` renders the large 2×2 variant.
export function EnvironmentTile({ track, featured = false, featuredLabel }) {
  const { current, playing } = useAudio();
  const openEnv = useOpenEnvironment();
  const cat = catOf(track);
  const Icon = cat.icon;
  const live = current?.id === track.id && playing;

  return (
    <button
      type="button"
      className={`${styles.tile} ${featured ? styles.featured : ""} ${live ? styles.live : ""}`}
      style={{ "--tint": cat.tint }}
      onClick={() => openEnv(track)}
    >
      <div className={styles.tileTop}>
        <span className={styles.iconCircle}>
          <Icon size={featured ? 20 : 16} />
        </span>
        {featured && (
          <span className={styles.nowTag}>
            <span className={styles.nowDot} />
            {featuredLabel}
          </span>
        )}
      </div>
      <div className={styles.flex} />
      <div className={styles.tileName}>{track.name}</div>
      <div className={styles.tileBy}>by {track.by}</div>
      {featured && (
        <div className={styles.featuredFoot}>
          {track.tags.slice(0, 4).map((t) => (
            <span key={t} className={styles.hashTag}>
              #{t}
            </span>
          ))}
          <span className={styles.flex} />
          <span className={styles.enter}>
            Enter environment <ArrowRight />
          </span>
        </div>
      )}
    </button>
  );
}

// Saved sound tile. Saved rows only store the Freesound id and a name, so
// the recording's details are fetched per tile.
export function SavedTile({ sound }) {
  const { current } = useAudio();
  const openEnv = useOpenEnvironment();
  const { data } = useFetchedAudio(
    `${import.meta.env.VITE_API_URL}/sounds/${sound.freesound_id}`,
  );

  const track = data
    ? toTrack(data, sound.name)
    : { id: sound.freesound_id, name: sound.name, tags: [], by: "", duration: 0 };
  const cat = catOf(track);
  const Icon = cat.icon;

  return (
    <button
      type="button"
      className={`${styles.saved} ${current?.id === track.id ? styles.savedCurrent : ""}`}
      style={{ background: cat.tint }}
      onClick={() => data && openEnv(track)}
      disabled={!data}
    >
      <div className={styles.savedTop}>
        <Icon size={20} className={styles.savedIcon} />
        <span className={styles.savedCat}>{cat.label}</span>
      </div>
      <div className={styles.savedText}>
        <div className={styles.savedName}>{track.name}</div>
        <div className={styles.savedBy}>
          {data ? `by ${track.by} · ${fmt(track.duration)}` : "Loading…"}
        </div>
      </div>
    </button>
  );
}
