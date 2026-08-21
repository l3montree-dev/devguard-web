import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-plugin-prettier";
import nextConfig from "eslint-config-next/core-web-vitals";
import requireLoadingBoundary from "./eslint-rules/require-loading-boundary.mjs";

export default defineConfig([
  globalIgnores([
    "**/postcss.config.js",
    "**/tailwind.config.js",
    "**/next.config.js",
    ".next/**",
  ]),
  ...nextConfig,
  {
    plugins: {
      prettier,
    },
    rules: {
      "@next/next/no-img-element": "off",
      "prettier/prettier": "error",
    },
  },
  {
    files: ["src/app/**/page.tsx"],
    plugins: {
      local: { rules: { "require-loading-boundary": requireLoadingBoundary } },
    },
    rules: {
      "local/require-loading-boundary": "error",
    },
  },
]);
