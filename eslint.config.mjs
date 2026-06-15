import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-plugin-prettier";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  globalIgnores([
    "**/postcss.config.js",
    "**/tailwind.config.js",
    "**/next.config.js",
  ]),
  {
    extends: nextCoreWebVitals,

    plugins: {
      prettier,
    },

    rules: {
      "@next/next/no-img-element": "off",
      "prettier/prettier": "error",
    },
  },
  {
    ignores: ["postcss.config.js", "tailwind.config.js", "next.config.js"],
  },
]);
