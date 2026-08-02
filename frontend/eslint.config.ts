import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
    ],
  },

  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,jsx}"],

    plugins: {
      js,
      react: pluginReact,
      "react-hooks": reactHooks as any,
    },

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      pluginReact.configs.flat.recommended,
      
    ],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      // React 17+ / Vite JSX transform
      "react/react-in-jsx-scope": "off",

      // TypeScript mein PropTypes ki zarurat nahi
      "react/prop-types": "off",

      // Existing project mein any allow
      "@typescript-eslint/no-explicit-any": "off",

      // Unused expressions ke false positives avoid
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
]);