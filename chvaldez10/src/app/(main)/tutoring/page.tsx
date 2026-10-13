import type { Metadata } from "next";
import Link from "next/link";
import TutoringInquiryDialog from "@/components/tutoring/TutoringInquiryDialog";
import styles from "./tutoring.module.css";

export const metadata: Metadata = {
  title: "Grades 7–12 Math & Science Tutoring | Christian Valdez",
  description:
    "Clear, thoughtful math and science tutoring for students in grades 7–12 from Christian Valdez.",
};

const topics = [
  {
    number: "01",
    title: "Math, grades 7–9",
    description:
      "Get help with fractions, ratios, equations, graphs, and word problems.",
    formula: "a / b",
  },
  {
    number: "02",
    title: "Math, grades 10–12",
    description:
      "Work through functions, trigonometry, and calculus when it is part of your course.",
    formula: "f(x) = x²",
  },
  {
    number: "03",
    title: "Science, grades 7–12",
    description:
      "Get help understanding biology, chemistry, and physics concepts and problems.",
    formula: "F = ma",
  },
];

const approach = [
  {
    title: "Start with the hard part",
    description:
      "Tell me what you are studying and which part is confusing. We will start there.",
  },
  {
    title: "Explain it clearly",
    description:
      "I use simple steps, diagrams, and examples to explain the idea.",
  },
  {
    title: "Practice together",
    description:
      "You try a similar problem so we can check what makes sense and what needs more work.",
  },
];

function MathGraph() {
  return (
    <figure
      className={`${styles.graph} relative isolate overflow-hidden rounded-3xl border border-orange-200 p-5 text-gray-900 shadow-xl shadow-orange-900/10 sm:p-8`}
    >
      <div
        className={`${styles.graphGrid} absolute inset-0 -z-10`}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-orange-700 uppercase">
            A math example
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            f(x) = x<sup>2</sup>
          </p>
        </div>
        <span className="rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs text-gray-700">
          Example: a graph
        </span>
      </div>

      <svg
        viewBox="0 0 440 400"
        aria-labelledby="graph-title graph-description"
        className="mt-3 h-auto w-full"
      >
        <title id="graph-title">
          A parabola and its tangent at x equals one
        </title>
        <desc id="graph-description">
          The curve y equals x squared passes through x equals one. Its tangent
          there has slope two.
        </desc>
        <path
          d="M 40 330 H 400 M 220 365 V 25"
          stroke="#6b7280"
          strokeWidth="1.5"
        />
        <path
          d="M 85 52 Q 220 628 355 52"
          fill="none"
          stroke="#fb923c"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 220 372 L 365 166"
          fill="none"
          stroke="#be185d"
          strokeWidth="2"
          strokeDasharray="7 7"
        />
        <circle
          cx="265"
          cy="308"
          r="7"
          fill="#ffffff"
          stroke="#fb923c"
          strokeWidth="3"
        />
        <text x="391" y="350" fill="#4b5563" fontSize="15">
          x
        </text>
        <text x="234" y="35" fill="#4b5563" fontSize="15">
          y
        </text>
        <text x="277" y="299" fill="#9d174d" fontSize="15">
          (1, 1)
        </text>
      </svg>

      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-200 pt-5 text-sm text-gray-700">
        <span>A graph helps show how an equation changes.</span>
        <span className="rounded-full bg-orange-100 px-4 py-2 font-medium text-orange-800">
          At x = 1, the slope is 2.
        </span>
      </figcaption>
    </figure>
  );
}

export default function TutoringPage() {
  return (
    <>
      <section
        className={`${styles.hero} min-h-screen pt-32 pb-24 sm:pt-40 sm:pb-32`}
      >
        <div className="home-container grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <Link
              href="/#background"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-800 underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700"
            >
              <span aria-hidden="true">←</span> Back to homepage
            </Link>
            <p className="mt-12 text-xs font-bold tracking-[0.22em] text-orange-700 uppercase">
              Grades 7–12 / Math + science tutoring
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Math and science tutoring{" "}
              <span className="text-pink-700">for grades 7–12.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-700">
              I help students understand tough topics and practice the problems
              they are learning in class. We work at the student&apos;s pace,
              with clear explanations and time for questions.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <TutoringInquiryDialog label="Ask about tutoring" />
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center font-semibold text-gray-800 underline decoration-orange-500 decoration-2 underline-offset-4 hover:text-pink-800 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-700"
              >
                How tutoring works
              </a>
            </div>
          </div>
          <MathGraph />
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="home-container">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.22em] text-orange-700 uppercase">
              Subjects
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-950 sm:text-5xl">
              Help with the topics you are studying.
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-700">
              I have engineering degrees from the University of Calgary. I use
              that background to explain math and science in ways students can
              follow.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {topics.map(({ number, title, description, formula }) => (
              <article
                key={number}
                className="flex min-h-64 flex-col rounded-2xl border border-orange-200 bg-(--brand-secondary-100) p-6 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold tracking-widest text-orange-700">
                    {number} / 03
                  </span>
                  <span
                    className="font-mono text-lg text-pink-700"
                    aria-hidden="true"
                  >
                    {formula}
                  </span>
                </div>
                <h3 className="mt-auto pt-12 text-xl font-bold text-gray-950">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-(--brand-secondary-100) py-24 sm:py-32"
      >
        <div className="home-container grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-orange-700 uppercase">
              How tutoring works
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-950 sm:text-5xl">
              We focus on what your student needs.
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-700">
              The aim is to understand the topic, then feel ready to try the
              next problem.
            </p>
          </div>
          <ol className="space-y-4">
            {approach.map(({ title, description }, index) => (
              <li
                key={title}
                className="grid gap-4 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm sm:grid-cols-[3rem_1fr] sm:p-7"
              >
                <span className="font-mono text-2xl font-semibold text-pink-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700 sm:text-base">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="home-container flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.22em] text-orange-700 uppercase">
              Get in touch
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-950 sm:text-5xl">
              Ask about math or science tutoring.
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-700">
              Tell me the student&apos;s grade, subject, and the topic they need
              help with. I&apos;ll reply so we can discuss the next step.
            </p>
          </div>
          <TutoringInquiryDialog label="Send an inquiry" />
        </div>
      </section>
    </>
  );
}
