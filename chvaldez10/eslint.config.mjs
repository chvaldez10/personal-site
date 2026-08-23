// This config is inert: `pnpm lint` runs Oxlint instead, which needs no TypeScript
// compiler and so works on TS 7. Kept for when typescript-eslint gains TS 7 support
// (typescript-eslint/typescript-eslint#10940), at which point `eslint .` becomes usable
// again and this recovers the type-aware rules Oxlint cannot provide.
//
// Running `eslint .` today fails on load with "typescript-eslint does not support TS 7.0",
// because eslint-config-next imports typescript-eslint unconditionally. To lint with
// ESLint before then, temporarily install typescript@6. Do NOT alias `typescript` to
// @typescript/typescript6 as the TypeScript 7 release notes suggest: it fixes lint but
// breaks `next build` and `next dev`, which no longer detect TypeScript under that name.
//
// ESLint is pinned to 9 because eslint-plugin-react (7.37.5, latest) declares a peer range
// of eslint "<=^9.7" and calls the context.getFilename() API that ESLint 10 removed. It
// only does so while auto-detecting the React version, so the settings.react.version pin
// below is enough to make ESLint 10 work if you want to move up.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescript,
  { settings: { react: { version: "19.2.8" } } },
];

export default config;
