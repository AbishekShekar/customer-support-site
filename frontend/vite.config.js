import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,

    allowedHosts: [
      "simmering-probing-shrine.ngrok-free.dev",
    ],

    proxy: {
      "/api": {
        target: "http://10.215.232.155:8000",
        changeOrigin: true,
        secure: false,
      },
    },

    hmr: {
      protocol: "wss",
      host: "simmering-probing-shrine.ngrok-free.dev",
      clientPort: 443,
    },
  },
});