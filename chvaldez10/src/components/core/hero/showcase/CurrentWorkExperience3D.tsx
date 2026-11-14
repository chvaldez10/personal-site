import BoxOfficeExperience from "./BoxOfficeExperience";
import styles from "./showcase.module.css";

export default function CurrentWorkExperience3D() {
  return (
    <section
      id="current-work-experience"
      aria-labelledby="experience-heading"
      className={styles.experience}
    >
      <div className={`home-container ${styles.experienceLayout}`}>
        <div className={styles.story}>
          <p className={styles.eyebrow}>Showpass · Software QA Analyst</p>
          <h2 id="experience-heading">I help make ticketing work.</h2>
          <p className={styles.description}>
            I’m a Software QA Analyst at Showpass. I test ticketing so it works
            reliably when people need it.
          </p>
        </div>
        <BoxOfficeExperience />
      </div>
    </section>
  );
}
