import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "pages/login.html"),
        signup: resolve(__dirname, "pages/signup.html"),
        // settings: resolve(__dirname, "pages/settings.html"),
        cities: resolve(__dirname, "pages/cities.html"),
      },
    },
  },
});
