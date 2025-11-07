import typescriptEslint from "typescript-eslint";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript ESLint recommended (không dùng strict)
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
      // TypeScript rules - relaxed
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // Cho phép dùng any
      "@typescript-eslint/no-require-imports": "off", // Cho phép require()
      "@typescript-eslint/no-empty-function": "off", // Cho phép function rỗng
      "@typescript-eslint/ban-ts-comment": "off", // Cho phép @ts-ignore

      // React hooks rules
      "react-hooks/rules-of-hooks": "error", // Giữ lại vì quan trọng
      "react-hooks/exhaustive-deps": "warn", // Chỉ warning

      // General rules - thoải mái
      "prefer-const": "warn", // Chỉ warning
      "no-var": "warn", // Chỉ warning
      "no-console": "off", // Cho phép console.log thoải mái
    },
  },

  // Test files - rất relaxed
  {
    files: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "react-hooks/rules-of-hooks": "off",
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
