import BoxOffice from "./BoxOffice";
import styles from "./CurrentWorkExperience.module.css";

export default function CurrentWorkExperience() {
  return (
    <section
      id="current-work-experience"
      aria-labelledby="experience-heading"
      className={styles.section}
    >
      <div className={styles.wall} aria-hidden="true" />
      <div className={styles.room}>
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeFace}>
            <span className={styles.marqueeStar}>✦</span>
            <span>SHOWPASS BOX OFFICE</span>
            <span className={styles.marqueeStar}>✦</span>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.story}>
            <p className={styles.eyebrow}>Now showing / What I do at work</p>
            <h2 id="experience-heading">
              I help make ticketing work.
            </h2>
            <p className={styles.description}>
              I’m a Software QA Analyst at Showpass. I test ticketing so it works
              reliably when people need it.
            </p>
            <div className={styles.roleSlip}>
              <span className={styles.roleDot} aria-hidden="true" />
              <div>
                <strong>Software QA Analyst</strong>
                <span>Showpass · Live experiences</span>
              </div>
            </div>
            <p className={styles.invitation}>
              Pick a show to see a sample ticket come through.
            </p>
          </div>

          <BoxOffice />
        </div>
      </div>
    </section>
  );
}
