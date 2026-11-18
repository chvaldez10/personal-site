import { fetchBrandLogos } from "@/lib/data/brandLogos";
import ToolDrawer from "./ToolDrawer";
import styles from "./studio.module.css";

export default async function TechFinds() {
  const logos = await fetchBrandLogos();
  return (
    <section
      id="tech-finds"
      aria-labelledby="tools-heading"
      tabIndex={-1}
      className={`${styles.section} ${styles.toolSection}`}
    >
      <div className={`${styles.inner} ${styles.toolLayout}`}>
        <div>
          <h2 id="tools-heading" className={styles.sectionTitle}>
            Tools I use every day
          </h2>
          <p className={styles.sectionCopy}>
            The apps and tools I reach for when I’m building, testing, or
            figuring something out.
          </p>
        </div>
        {logos?.length ? (
          <ToolDrawer logos={logos} />
        ) : (
          <p className={styles.empty}>
            {logos
              ? "I haven’t added any tools here yet."
              : "My tools are temporarily unavailable. Please try again later."}
          </p>
        )}
      </div>
    </section>
  );
}
