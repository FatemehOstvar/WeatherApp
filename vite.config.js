import { defineConfig } from "vite";

export default defineConfig({
  base: "/WeatherApp/",
  build: { outDir: "docs" },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
