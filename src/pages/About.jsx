import styles from "../styles/About.module.css";

function About() {
  return (
    <div className={styles.page}>
      <div className={styles.kicker}>Relax • Focus • Drift</div>

      <h1 className={styles.title}>About Ambient</h1>

      <div className={styles.body}>
        <p>
          Ambient is an immersive sound environment experience designed to
          help you slow down, focus, study, meditate, or simply exist in a
          calmer space for a while.
        </p>

        <p>
          Explore peaceful environments like rainfall, ocean waves, crackling
          fireplaces, and other atmospheric soundscapes curated to help your
          mind settle into the present moment.
        </p>

        <p>
          Whether you need background ambience while working, a calming space
          while reading, or gentle audio to unwind at night, Ambient gives
          you a simple escape into sound.
        </p>
      </div>

      <div className={styles.rule} />

      <blockquote className={styles.quote}>
        “Put on a soundscape. Breathe deeper. Stay awhile.”
      </blockquote>
    </div>
  );
}

export default About;
