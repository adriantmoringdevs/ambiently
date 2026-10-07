import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/sounds": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/signup": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/login": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/logout": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/check_session": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
