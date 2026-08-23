// Pinned to ESLint 9: eslint-config-next depends on eslint-plugin-react, whose
// latest release (7.37.5) declares a peer range of eslint "<=^9.7". Under ESLint 10
// it throws "contextOrFilename.getFilename is not a function".
//
// Relatedly, typescript-eslint has no TypeScript 7 support yet
// (typescript-eslint/typescript-eslint#10940), so package.json aliases `typescript`
// to @typescript/typescript6 for the compiler API this config needs, and exposes
// the native TS 7 compiler as `@typescript/native` for `tsc`/`next build`.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescript,
];

export default config;
