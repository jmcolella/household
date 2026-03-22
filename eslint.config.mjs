import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Enforce absolute imports in app/ directory
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "./*"],
              message: "Use absolute imports with @/ alias instead of relative imports in the app/ directory",
            },
          ],
        },
      ],
      // Allow functions as children (React 19 pattern)
      "react/no-children-prop": ["error", { allowFunctions: true }],
    },
  },
]);

export default eslintConfig;
