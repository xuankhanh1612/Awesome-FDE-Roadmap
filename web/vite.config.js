import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// `VITE_BASE` is set by the GitHub Pages workflow so assets resolve under
// /Awesome-FDE-Roadmap/. Local builds keep relative asset paths.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE || "./";

  return {
    plugins: [react()],
    base,
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      allowedHosts: true,
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
      allowedHosts: true,
    },
  };
});
