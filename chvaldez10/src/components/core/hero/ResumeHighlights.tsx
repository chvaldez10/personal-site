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
      className="min-h-screen bg-(--brand-secondary-100) py-24 sm:py-32"
    >
      <div className="home-container">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-sm font-semibold tracking-widest text-orange-700 uppercase">
            <span className="h-1 w-6 bg-orange-500" aria-hidden="true" />
            The path so far
          </p>
          <h2
            id="background-heading"
            className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            Built across code, quality, and research.
          </h2>
          <p className="mt-5 text-base leading-7 text-gray-700">
            My engineering background shapes how I build, test, and improve
            software.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="grid gap-6">
            <article className="relative overflow-hidden rounded-2xl border border-orange-200 bg-white p-6 shadow-sm sm:p-8">
              <span
                className="absolute top-0 right-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 rounded-full bg-(--brand-secondary-200)"
                aria-hidden="true"
              />
              <p className="relative text-xs font-bold tracking-widest text-orange-700 uppercase">
                01 / Education
              </p>
              <h3 className="relative mt-5 text-xl font-bold text-gray-900">
                Schulich School of Engineering
              </h3>
              <p className="relative mt-1 text-sm text-gray-600">
                University of Calgary
              </p>
              <ul className="relative mt-6 space-y-3 border-l-2 border-orange-300 pl-5 text-sm leading-6 text-gray-800 sm:text-base">
                <li>Master of Engineering in Software</li>
                <li>Bachelor of Science in Electrical Engineering</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold tracking-widest text-orange-700 uppercase">
                02 / Skills
              </p>
              <h3 className="mt-5 text-xl font-bold text-gray-900">
                The toolkit
              </h3>
              <dl className="mt-5 divide-y divide-orange-100">
                {skillGroups.map(({ label, items }) => (
                  <div key={label} className="py-3 first:pt-0 last:pb-0">
                    <dt className="text-xs font-bold tracking-wide text-gray-600 uppercase">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-800">
                      {items}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>

          <article className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold tracking-widest text-orange-700 uppercase">
              03 / Experience
            </p>
            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Before Showpass
            </h3>
            <ol className="mt-7 border-l-2 border-orange-300 pl-6">
              {earlierRoles.map(
                ({ role, organization, dates, description }) => (
                  <li key={role} className="relative pb-10 last:pb-0">
                    <span
                      className="absolute top-1 -left-[31px] h-3.5 w-3.5 rounded-full border-2 border-orange-500 bg-white"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-semibold tracking-wide text-orange-700 uppercase">
                      {dates}
                    </p>
                    <h4 className="mt-2 text-lg font-bold text-gray-900">
                      {role}
                    </h4>
                    <p className="mt-1 text-sm font-medium text-gray-600">
                      {organization}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-gray-700 sm:text-base">
                      {description}
                    </p>
                  </li>
                ),
              )}
            </ol>
          </article>
        </div>
      </div>
    </section>
  );
}
