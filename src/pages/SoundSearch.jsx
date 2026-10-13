import { useState, useCallback, useEffect, useRef } from "react";
import { CircleNotch, MagnifyingGlass, Waveform } from "@phosphor-icons/react";
import SearchResultCard from "../components/SearchResultCard";
import { useAudio } from "../context/AudioContext";
import { toTrack } from "../lib/sounds";
import styles from "../styles/SoundSearch.module.css";

const SKELETON_WIDTHS = ["62%", "48%", "70%"];

function SoundSearch() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [sounds, setSounds] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [saveOpenId, setSaveOpenId] = useState(null);
  const [saveName, setSaveName] = useState("");
  const [saveError, setSaveError] = useState(null);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const requestRef = useRef(0);
  const { savedSounds, addSound } = useAudio();

  // fetches a page of 20 sounds for a query; responses from a superseded search are dropped
  const fetchSounds = useCallback(async (searchQuery, pageNum) => {
    const request = ++requestRef.current;
    loadingRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/sounds/search?query=${encodeURIComponent(searchQuery)}&page=${pageNum}`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      if (request !== requestRef.current) return;
      const tracks = data.results.map((s) => toTrack(s));
      setSounds((prev) => (pageNum === 1 ? tracks : [...prev, ...tracks]));
      setCount(data.count ?? 0);
      setPage(pageNum);
      setHasMore(data.next !== null);
    } catch {
      if (request !== requestRef.current) return;
      setError(true);
      setHasMore(false);
    } finally {
      if (request === requestRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSubmittedQuery(q);
    setSounds([]);
    setCount(0);
    setPage(0);
    setHasMore(true);
    setSaveOpenId(null);
    fetchSounds(q, 1);
  };

  // instantiates a new observer for sentinelRef at bottom of page, if it comes in view, it checks hasMore
  // and loading and fetches the next page, thus achieving a "endless scroll" feel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current && page > 0) {
          fetchSounds(submittedQuery, page + 1);
        }
      },
      { threshold: 0.1 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, submittedQuery, fetchSounds]);

  function openSave(track) {
    setSaveOpenId(track.id);
    setSaveName(track.name);
    setSaveError(null);
  }

  function cancelSave() {
    setSaveOpenId(null);
    setSaveName("");
    setSaveError(null);
  }

  function confirmSave(track) {
    const name = saveName.trim();
    if (!name) return;
    addSound(track.id, name)
      .then(cancelSave)
      .catch(() => setSaveError("Couldn't save this sound. Try again."));
  }

  const savedIds = new Set(savedSounds.map((s) => s.freesound_id));

  return (
    <div className={styles.page}>
      <div className={styles.kicker}>The Freesound library</div>
      <h1 className={styles.title}>Search sounds</h1>
      <p className={styles.lede}>
        Preview anything from the community library. Save the ones you love —
        they become environments on your home page.
      </p>

      <form className={styles.searchRow} onSubmit={handleSearch} role="search">
        <div className={styles.searchField}>
          <MagnifyingGlass size={17} />
          <input
            type="text"
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rain, forest, cafe, ocean…"
            aria-label="Search sounds"
          />
        </div>
        <button type="submit" className={styles.searchBtn}>
          Search
        </button>
      </form>

      {submittedQuery && (
        <section className={styles.results}>
          <div className={styles.resultsHead}>
            <h2 className={styles.resultsTitle}>Results for “{submittedQuery}”</h2>
            <span className={styles.meta}>
              {sounds.length} of {count} loaded
              {hasMore && " · scroll for more"} · {savedSounds.length} saved
            </span>
          </div>
          <div className={styles.rule} />

          <div className={styles.list}>
            {sounds.map((track) => (
              <SearchResultCard
                key={track.id}
                track={track}
                saved={savedIds.has(track.id)}
                saveOpen={saveOpenId === track.id}
                saveName={saveName}
                saveError={saveOpenId === track.id ? saveError : null}
                onSaveName={setSaveName}
                onOpenSave={() => openSave(track)}
                onConfirmSave={() => confirmSave(track)}
                onCancelSave={cancelSave}
              />
            ))}
          </div>

          {loading && (
            <div className={styles.list} aria-live="polite">
              {SKELETON_WIDTHS.map((w) => (
                <div key={w} className={styles.skeletonRow}>
                  <span className={styles.skCircle} />
                  <div className={styles.skText}>
                    <span className={styles.skLine} style={{ width: w }} />
                    <span className={styles.skSub} />
                  </div>
                  <span className={styles.skTags} />
                  <span className={styles.skDur} />
                  <span className={styles.skBtn} />
                </div>
              ))}
              <div className={styles.loadingNote}>
                <CircleNotch size={16} className={styles.spin} />
                {page === 0 ? "Searching Freesound…" : "Loading the next 20 sounds…"}
              </div>
            </div>
          )}

          {error && !loading && (
            <p className={styles.note}>Something went wrong reaching Freesound. Try searching again.</p>
          )}

          {!loading && !error && sounds.length === 0 && (
            <p className={styles.note}>No sounds found for “{submittedQuery}”.</p>
          )}

          {!hasMore && !loading && sounds.length > 0 && (
            <div className={styles.end}>
              <Waveform size={20} className={styles.endIcon} />
              You've reached the end of the soundscape.
            </div>
          )}
        </section>
      )}

      <div ref={sentinelRef} className={styles.sentinel} />
    </div>
  );
}

export default SoundSearch;
