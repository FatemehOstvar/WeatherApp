import { defineConfig } from "vite";

export default defineConfig({
  base: "/WeatherApp/", // <-- use '/' only if deploying to USERNAME.github.io root
  build: { outDir: "docs" },
});
