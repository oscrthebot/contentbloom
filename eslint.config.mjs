import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "pipeline/**",
    "cli/**",
    "scraper/**",
    "generator/**",
    "scripts/**",
    "venv/**",
    "node_modules/**",
  ]),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]);

export default eslintConfig;
