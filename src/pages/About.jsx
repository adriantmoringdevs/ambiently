import styles from "../styles/About.module.css";

function About() {
  return (
    <>

      <main className={styles.main}>
        <div className={styles.glow}></div>

        <section className={styles.aboutCard}>
          <span className={styles.tag}>
            Relax • Focus • Drift
          </span>

          <h1 className={styles.title}>
            About Ambient
          </h1>

          <p className={styles.description}>
            Ambient is an immersive sound environment experience designed to
            help you slow down, focus, study, meditate, or simply exist in a
            calmer space for a while.
          </p>

          <p className={styles.description}>
            Explore peaceful environments like rainfall, ocean waves, crackling
            fireplaces, and other atmospheric soundscapes curated to help your
            mind settle into the present moment.
          </p>

          <p className={styles.description}>
            Whether you need background ambience while working, a calming space
            while reading, or gentle audio to unwind at night, Ambient gives
            you a simple escape into sound.
          </p>

          <div className={styles.quote}>
            “Put on a soundscape. Breathe deeper. Stay awhile.”
          </div>
        </section>
      </main>
    </>
  );
}

export default About;