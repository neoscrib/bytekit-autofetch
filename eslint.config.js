import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";

export default tseslint.config(
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": ["off"], // @typescript-eslint/no-unused-vars takes place of this
      "no-undef": ["off"]
    }
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {prettier},
    rules: {
      "prettier/prettier": "error"
    }
  }
);
