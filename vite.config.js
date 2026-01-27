import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync("certs/localhost-key.pem"),
      cert: fs.readFileSync("certs/localhost.pem"),
    },
    proxy: {
      "/api": {
        target: "http://localhost:5002",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    sourcemap: false,
  },
});
