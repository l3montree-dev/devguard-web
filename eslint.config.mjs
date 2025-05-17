import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-plugin-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "**/postcss.config.js",
    "**/tailwind.config.js",
    "**/next.config.js",
  ]),
  {
    extends: compat.extends("next/core-web-vitals"),

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
