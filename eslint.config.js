import { defineConfig } from "eslint/config";
import config from "eslint-config-typescript";
import prettier from "eslint-config-prettier";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"] },
  config,
  prettier
]);