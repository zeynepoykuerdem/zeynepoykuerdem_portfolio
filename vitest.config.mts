import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Resolves the @/* alias from tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: { environment: "jsdom" },
});
