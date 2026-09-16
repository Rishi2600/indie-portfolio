import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // The "@/…" alias from tsconfig.json, so tests import modules the way
    // the application does.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Every test that stubs the environment or swaps a module gets a clean
    // slate afterwards, so no test can pass because of another's leftovers.
    unstubEnvs: true,
    unstubGlobals: true,
    restoreMocks: true,
  },
});
