import typescriptEslint from "typescript-eslint";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript ESLint rules
  ...typescriptEslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: typescriptEslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",

      // React hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General rules
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // Test files - relaxed rules
  {
    files: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: typescriptEslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // Relaxed rules for tests
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in tests
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
      "@typescript-eslint/no-require-imports": "off", // Allow require() in tests
      "no-console": "off", // Allow console.log in tests
      "react-hooks/rules-of-hooks": "off", // Disable React hooks rules in test files
      "react-hooks/exhaustive-deps": "off",
    },
  },

  // Ignore patterns
  {
    ignores: [
      ".next/",
      "node_modules/",
      "coverage/",
      "dist/",
      "build/",
      "*.config.js",
      "*.config.mjs",
    ],
  },
];
