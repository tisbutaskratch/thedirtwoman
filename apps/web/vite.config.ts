import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { metaForSite } from "./src/lib/siteMeta";

/**
 * Writes the title and link preview into index.html for whichever site is
 * being built.
 *
 * Both products share one HTML file, and unfurlers never run the app, so
 * setting document.title in React fixes the browser tab and nothing that
 * gets pasted into a chat.
 */
function siteMetaPlugin(site: string | undefined) {
  const meta = metaForSite(site);
  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  return {
    name: "site-meta",
    transformIndexHtml(html: string) {
      const tags = [
        `<title>${escape(meta.title)}</title>`,
        `<meta name="description" content="${escape(meta.description)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${escape(meta.title)}" />`,
        `<meta property="og:title" content="${escape(meta.title)}" />`,
        `<meta property="og:description" content="${escape(meta.description)}" />`,
        `<meta property="og:url" content="${meta.url}" />`,
        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:title" content="${escape(meta.title)}" />`,
        `<meta name="twitter:description" content="${escape(meta.description)}" />`,
        `<link rel="icon" href="${meta.favicon}" />`,
        // Same drawing for the home-screen icon: an SVG scales to whatever
        // size iOS asks for, so there is no set of PNGs to keep in step.
        `<link rel="apple-touch-icon" href="${meta.favicon}" />`,
        `<meta name="theme-color" content="${meta.themeColor}" />`,
      ].join("\n    ");
      return html.replace("<!--site-meta-->", tags);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    siteMetaPlugin(loadEnv(mode, process.cwd(), "").VITE_SITE),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
}));
