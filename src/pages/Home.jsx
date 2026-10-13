import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SoundCard from "../components/SoundCard";
import styles from "../styles/Home.module.css";
import { useAudio } from "../context/AudioContext";
import { useUser } from "../context/UserContext";
import ambientLogo from "../assets/ambient_logo.svg";


function Home() {
  const [filter, setFilter] = useState("");
  const [curatedSounds, setCuratedSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { savedSounds } = useAudio()
  const { user } = useUser()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/curated-sounds`)
    .then((r) => r.json())
    .then((data) => {
      setCuratedSounds(data);
      setLoading(false)
    });
  }, []);

  const filteredSounds = curatedSounds.filter((sound) =>
    sound.custom_name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <>

      <main className={styles.main}>
        <div className={styles.overlay}></div>

        <section className={styles.hero}>
          <img src={ambientLogo} alt="Ambient" className={styles.heroLogo} />

          <p className={styles.subtitle}>
            Drift into immersive sound environments designed for focus,
            relaxation, sleep, and calm.
          </p>

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Filter environments..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </section>

        <section className={styles.soundSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Choose Your Environment</h2>
            <span className={styles.soundCount}>
              {filteredSounds.length} ambient spaces
            </span>
          </div>

          {loading ? (
            <p className={styles.emptyMessage}>Loading environments...</p>
          ) : (
            <div className={styles.soundGrid}>
              {filteredSounds.map((sound) => (
                <SoundCard
                  key={sound.id}
                  id={sound.id}
                  name={sound.custom_name}
                  data={sound}
                />
              ))}
            </div>
          )}
        </section>

        <section className={styles.soundSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Saved Sounds</h2>
            {user && (
              <span className={styles.soundCount}>
                {savedSounds.length} saved
              </span>
            )}
          </div>

          {user ? (
            savedSounds.length > 0 ? (
              <div className={styles.soundGrid}>
                {savedSounds.map((sound) => (
                  <SoundCard key={sound.freesound_id} id={sound.freesound_id} name={sound.name} />
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>
                You haven't saved any sounds yet. Head to <Link to="/search">Search</Link> to find some!
              </p>
            )
          ) : (
            <div className={styles.loginPrompt}>
              <p>Sign in to save your own ambient sounds.</p>
              <Link to="/login" className={styles.loginLink}>
                Login / Sign Up
              </Link>
            </div>
          )}
        </section>

      </main>
    </>
  );
}

export default Home;