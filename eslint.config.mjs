import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    // `app/` is the showcase workbench, not the published library. Its theme bootstrap
    // reads a client-only preference after mount so the server render and hydration stay
    // on the default theme; React's alternative for that pattern is a sync external store,
    // which is not worth a store for a showcase toggle.
    files: ["app/**/*.{ts,tsx}"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "dist/**", ".rollup.cache/**", "next-env.d.ts"]),
]);

export default eslintConfig;
