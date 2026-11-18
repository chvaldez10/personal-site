import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import styles from "./studio.module.css";

const skillGroups = [
  {
    label: "Languages",
    items: "TypeScript, JavaScript, Python, SQL, HTML, CSS, Bash",
  },
  {
    label: "Testing & automation",
    items: "Playwright, Cypress, Postman, BrowserStack, Qase, REST APIs",
  },
  {
    label: "Development",
    items: "React, Next.js, Django",
  },
  {
    label: "Data",
    items: "PostgreSQL, MySQL, MongoDB",
  },
  {
    label: "Tools & CI/CD",
    items: "Git, GitHub Actions, Docker, Jira, OpenAI, Gemini",
  },
];

const earlierRoles = [
  {
    role: "Graduate Research Assistant",
    organization: "Biometric Technology Lab",
    dates: "Jun 2023 – Apr 2024",
    description:
      "Built computer vision and sensor data tools, and improved breathing-pattern detection accuracy by 10% through machine learning experiments.",
  },
  {
    role: "Software Quality Assurance Intern",
    organization: "Computer Modelling Group Ltd.",
    dates: "Jul 2021 – Apr 2023",
    description:
      "Automated test data collection, reporting, and scheduled validation; helped catch memory leaks and performance regressions.",
  },
];

export default function ResumeHighlights() {
  return (
    <section
      id="background"
      aria-labelledby="background-heading"
      className={`${styles.section} ${styles.background}`}
    >
      <div className={styles.inner}>
        <div className={styles.splitHeading}>
          <div>
            <p className={styles.kicker}>How I got here</p>
            <h2 id="background-heading" className={styles.sectionTitle}>
              I learned by building and testing.
            </h2>
          </div>
          <p className={styles.sectionCopy}>
            My background in engineering, research, and QA shapes how I work:
            make something useful, check it carefully, and keep improving it.
          </p>
        </div>

        <div className={styles.notebook}>
          <div className={styles.timelinePage}>
            <h3>Before Showpass</h3>
            <ol className={styles.timeline}>
              {earlierRoles.map(
                ({ role, organization, dates, description }) => (
                  <li key={role}>
                    <p className={styles.kicker}>{dates}</p>
                    <h4>{role}</h4>
                    <p className={styles.organization}>{organization}</p>
                    <p>{description}</p>
                  </li>
                ),
              )}
            </ol>
          </div>
          <div className={styles.skillsPage}>
            <h3>Schulich School of Engineering</h3>
            <p className={styles.organization}>University of Calgary</p>
            <ul className={styles.degrees}>
              <li>Master of Engineering in Software</li>
              <li>Bachelor of Science in Electrical Engineering</li>
            </ul>
            <h3 className={styles.skillsHeading}>Skills</h3>
            <div className={styles.skillGroups}>
              {skillGroups.map(({ label, items }) => (
                <details key={label}>
                  <summary>
                    {label}
                    <Plus size={16} aria-hidden="true" />
                  </summary>
                  <p>{items}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <Link href="/tutoring" className={styles.tutoring} prefetch={false}>
          <div>
            <p className={styles.kicker}>Math and science · Grades 7–12</p>
            <h3>I help students make sense of math and science.</h3>
            <p>
              We work through what they’re learning in class with clear
              explanations and practice.
            </p>
          </div>
          <span>
            View tutoring <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  );
}
