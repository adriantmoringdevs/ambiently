import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { EnvironmentTile, SavedTile } from "../components/SoundCard";
import styles from "../styles/Home.module.css";
import { useAudio } from "../context/AudioContext";
import { useUser } from "../context/UserContext";
import { toTrack } from "../lib/sounds";

// Sticky hero that drifts up, shrinks and fades as the page scrolls.
function useHeroParallax(ref) {
  useEffect(() => {
    const hero = ref.current;
    if (!hero || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.max(0, Math.min(1, window.scrollY / 380));
      hero.style.transform = `translateY(${(-p * 36).toFixed(1)}px) scale(${(1 - p * 0.05).toFixed(3)})`;
      hero.style.opacity = (1 - p * 0.85).toFixed(3);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

function Home() {
  const [filter, setFilter] = useState("");
  const [curatedSounds, setCuratedSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { savedSounds, current, playing, lastPlayed } = useAudio()
  const { user } = useUser()
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useHeroParallax(heroRef);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/curated-sounds`)
    .then((r) => {
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    })
    .then((data) => {
      setCuratedSounds(data.map((s) => toTrack(s, s.custom_name)));
      setLoading(false)
    })
    .catch(() => {
      setLoadError(true);
      setLoading(false);
    });
  }, []);

  const f = filter.trim().toLowerCase();
  const matches = curatedSounds.filter(
    (s) =>
      !f ||
      s.name.toLowerCase().includes(f) ||
      s.tags.some((t) => t.toLowerCase().includes(f)),
  );

  // Unfiltered, the last-played environment leads as the featured tile.
  const featured = !f
    ? (curatedSounds.find((s) => s.id === lastPlayed) ?? curatedSounds[0])
    : null;
  const tiles = featured
    ? [featured, ...curatedSounds.filter((s) => s.id !== featured.id)]
    : matches;
  const featuredLabel =
    playing && featured && current?.id === featured.id ? "Now playing" : "Last played";

  return (
    <div className={styles.page}>
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.kicker}>Soundscapes for study, sleep &amp; focus</div>
        <h1 className={styles.title}>Step into a sound. Let the room disappear.</h1>
        <p className={styles.lede}>
          Each environment is a looping Freesound recording with a scene to
          match — and a sleep timer that stops it when you're done.
        </p>
        <div className={styles.filterRow}>
          <div className={styles.searchField}>
            <MagnifyingGlass size={17} />
            <input
              type="text"
              className={styles.input}
              placeholder="Filter environments"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter environments"
            />
          </div>
          {!loading && !loadError && (
            <span className={styles.count}>
              {matches.length} of {curatedSounds.length}
            </span>
          )}
        </div>
      </section>

      <div className={styles.content}>
        <section>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Environments</h2>
            {!loading && !loadError && (
              <span className={styles.count}>Curated · {curatedSounds.length} spaces</span>
            )}
          </div>
          <div className={styles.rule} />

          {loadError ? (
            <p className={styles.empty}>Unable to load environments right now.</p>
          ) : (
            <div className={styles.envGrid}>
              {loading
                ? Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className={`${styles.placeholder} ${i === 0 ? styles.placeholderBig : ""}`}
                    />
                  ))
                : tiles.map((track) => (
                    <EnvironmentTile
                      key={track.id}
                      track={track}
                      featured={featured?.id === track.id}
                      featuredLabel={featuredLabel}
                    />
                  ))}
              {!loading && !f && (
                <button
                  type="button"
                  className={styles.moreTile}
                  onClick={() => navigate("/search")}
                >
                  <Plus size={20} />
                  <div>
                    <div className={styles.moreTitle}>Find more sounds</div>
                    <div className={styles.moreSub}>Search the Freesound library</div>
                  </div>
                </button>
              )}
            </div>
          )}
          {!loading && f && matches.length === 0 && (
            <p className={styles.empty}>No environments match “{filter}”.</p>
          )}
        </section>

        <section className={styles.savedSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Your saved sounds</h2>
            {user && <span className={styles.count}>{savedSounds.length} saved</span>}
          </div>
          <div className={styles.rule} />

          {user ? (
            savedSounds.length > 0 ? (
              <div className={styles.savedGrid}>
                {savedSounds.map((sound) => (
                  <SavedTile key={sound.id ?? sound.freesound_id} sound={sound} />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>
                You haven't saved any sounds yet. Head to{" "}
                <Link to="/search" className={styles.link}>Search</Link> to find some!
              </p>
            )
          ) : (
            <div className={styles.signInBox}>
              <div>
                <div className={styles.signInTitle}>Keep the sounds you find.</div>
                <div className={styles.signInSub}>
                  Sign in to save Freesound recordings as your own environments.
                </div>
              </div>
              <button className={styles.signInBtn} onClick={() => navigate("/login")}>
                Sign in or create account
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
