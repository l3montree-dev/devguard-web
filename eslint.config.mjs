// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import nextConfig from "eslint-config-next/core-web-vitals";
import requireLoadingBoundary from "./eslint-rules/require-loading-boundary.mjs";
import noComponentTypeDeclarations from "./eslint-rules/no-component-type-declarations.mjs";
import requireSpdxHeader from "./eslint-rules/require-spdx-header.mjs";
import noRawFetch from "./eslint-rules/no-raw-fetch.mjs";
import noDataFetchingInView from "./eslint-rules/no-data-fetching-in-view.mjs";

const local = {
  rules: {
    "require-loading-boundary": requireLoadingBoundary,
    "no-component-type-declarations": noComponentTypeDeclarations,
    "require-spdx-header": requireSpdxHeader,
    "no-raw-fetch": noRawFetch,
    "no-data-fetching-in-view": noDataFetchingInView,
  },
};

const OURS = ["src/**/*.ts", "src/**/*.tsx"];

const DATA_LAYER = [
  "src/services/**",
  "src/hooks/**",
  "src/data-fetcher/**",
  "src/server/**",
  "src/pages/api/**",
];

const TESTS = ["**/*.test.ts", "**/*.test.tsx", "e2e/**"];

const NOT_OURS = ["next-env.d.ts", ".next/**", "src/types/api/**"];

export default tseslint.config([
  {
    ignores: [
      "**/postcss.config.js",
      "**/tailwind.config.js",
      "**/next.config.js",
      ".next/**",
    ],
  },
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
  { plugins: { local } },
  {
    files: [...OURS, "e2e/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: [...OURS, "e2e/**/*.ts"],
    ignores: NOT_OURS,
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          caughtErrors: "none",
          ignoreRestSiblings: true,
          // The usual escape hatch for a binding that has to stay.
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    files: ["src/app/**/page.tsx"],
    rules: {
      "local/require-loading-boundary": "error",
    },
  },

  // A type declared in a component body cannot be reused; it belongs in src/types/**.
  {
    files: OURS,
    ignores: [...NOT_OURS, ...TESTS],
    rules: {
      "local/no-component-type-declarations": "warn",
    },
  },

  // Every hand written file carries the AGPL SPDX tag.
  {
    files: [
      ...OURS,
      "e2e/**/*.ts",
      "eslint-rules/**/*.mjs",
      "eslint.config.mjs",
    ],
    ignores: NOT_OURS,
    rules: {
      "local/require-spdx-header": "warn",
    },
  },

  // Transport calls made by hand, outside the data layer.
  {
    files: OURS,
    ignores: [...DATA_LAYER, ...NOT_OURS, ...TESTS],
    rules: {
      "local/no-raw-fetch": "warn",
    },
  },

  // SWR belongs in a hook or a service, not in a page or a component.
  {
    files: ["src/app/**/*.ts", "src/app/**/*.tsx", "src/components/**/*.tsx"],
    ignores: [...DATA_LAYER, ...NOT_OURS, ...TESTS],
    rules: {
      "local/no-data-fetching-in-view": "warn",
    },
  },
]);
