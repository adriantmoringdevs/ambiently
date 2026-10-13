import { useNavigate } from "react-router-dom";
import { BookmarkSimple, Pause, Play } from "@phosphor-icons/react";
import { useAudio } from "../context/AudioContext";
import { useUser } from "../context/UserContext";
import { fmt } from "../lib/sounds";
import styles from "../styles/SearchResultCard.module.css";

// One search result row. The inline save panel is controlled by the page so
// only one row can be saving at a time.
function SearchResultCard({
  track,
  saved,
  saveOpen,
  saveName,
  saveError,
  onSaveName,
  onOpenSave,
  onConfirmSave,
  onCancelSave,
}) {
  const { current, playing, play } = useAudio();
  const { user } = useUser();
  const navigate = useNavigate();

  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && playing;

  function handleSaveClick() {
    if (!user) navigate("/login");
    else if (!saved) onOpenSave();
  }

  return (
    <div className={`${styles.row} ${isCurrent ? styles.current : ""}`}>
      <div className={styles.grid}>
        <button
          className={`${styles.preview} ${isPlaying ? styles.previewOn : ""}`}
          onClick={() => play(track)}
          aria-label={isPlaying ? `Pause ${track.name}` : `Preview ${track.name}`}
        >
          {isPlaying ? <Pause weight="fill" /> : <Play weight="fill" />}
        </button>

        <div className={styles.info}>
          <div className={styles.name}>{track.name}</div>
          <div className={styles.by}>by {track.by}</div>
        </div>

        <div className={styles.tags}>
          {track.tags.slice(0, 2).map((t) => (
            <span key={t} className={styles.tag}>
              #{t}
            </span>
          ))}
        </div>

        <span className={styles.duration}>{fmt(track.duration)}</span>

        <button
          className={`${styles.save} ${saved ? styles.saved : ""}`}
          onClick={handleSaveClick}
          aria-pressed={saved}
        >
          <BookmarkSimple weight={saved ? "fill" : "regular"} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {saveOpen && (
        <form
          className={styles.savePanel}
          onSubmit={(e) => {
            e.preventDefault();
            onConfirmSave();
          }}
        >
          <input
            className={styles.saveInput}
            value={saveName}
            onChange={(e) => onSaveName(e.target.value)}
            placeholder="Name this environment…"
            aria-label="Environment name"
            autoFocus
          />
          <button type="submit" className={styles.confirm} disabled={!saveName.trim()}>
            Save to my sounds
          </button>
          <button type="button" className={styles.cancel} onClick={onCancelSave}>
            Cancel
          </button>
          {saveError && <p className={styles.error}>{saveError}</p>}
        </form>
      )}

      <div className={styles.rowRule} />
    </div>
  );
}

export default SearchResultCard;
