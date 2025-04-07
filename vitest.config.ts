import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"]
    },
    exclude: [".stryker-tmp", "node_modules"]
  }
});
