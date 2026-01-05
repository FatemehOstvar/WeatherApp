import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "pages/login": resolve(__dirname, "pages/login.html"),
        "pages/signup": resolve(__dirname, "pages/signup.html"),
        // settings: resolve(__dirname, "pages/settings.html"),
        "pages/cities": resolve(__dirname, "pages/cities.html"),
      },
    },
  },
});
