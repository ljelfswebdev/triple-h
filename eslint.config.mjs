import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Existing effects synchronise state with route, storage, and network changes.
      // Refactor them incrementally; this React 19 advisory is not a correctness error.
      "react-hooks/set-state-in-effect": "off",
      // CMS thumbnails intentionally render remote URLs before their host is known.
      "@next/next/no-img-element": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    files: ["src/components/forms/FormClient.js"],
    rules: {
      // This value is derived from the CMS response; stabilising it is tracked with
      // the planned form-client extraction rather than suppressing this project-wide.
      "react-hooks/exhaustive-deps": "off",
    },
  },
  globalIgnores([".next/**", "coverage/**", "figma/**", "node_modules/**", "public/**"]),
]);
