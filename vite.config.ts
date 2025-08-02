import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

// ESモジュールで__dirnameの代替を作成
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "食費管理アプリ - 節約マスター",
        short_name: "節約マスター",
        description: "食費管理に特化したゲーミフィケーション家計簿アプリ",
        theme_color: "#667eea",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        lang: "ja",
        orientation: "portrait",
        scope: "/",
        id: "/",
        categories: ["finance", "lifestyle"],
        prefer_related_applications: false,
        icons: [
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"%3E%3Crect width="72" height="72" rx="16" fill="%23667eea"/%3E%3Ctext x="36" y="45" font-size="28" text-anchor="middle" fill="white"%3E🐷%3C/text%3E%3C/svg%3E',
            sizes: "72x72",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect width="96" height="96" rx="20" fill="%23667eea"/%3E%3Ctext x="48" y="60" font-size="36" text-anchor="middle" fill="white"%3E🐷%3C/text%3E%3C/svg%3E',
            sizes: "96x96",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"%3E%3Crect width="128" height="128" rx="26" fill="%23667eea"/%3E%3Ctext x="64" y="80" font-size="48" text-anchor="middle" fill="white"%3E🐷%3C/text%3E%3C/svg%3E',
            sizes: "128x128",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144"%3E%3Crect width="144" height="144" rx="30" fill="%23667eea"/%3E%3Ctext x="72" y="90" font-size="54" text-anchor="middle" fill="white"%3E🐷%3C/text%3E%3C/svg%3E',
            sizes: "144x144",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="152" height="152" viewBox="0 0 152 152"%3E%3Crect width="152" height="152" rx="32" fill="%23667eea"/%3E%3Ctext x="76" y="95" font-size="57" text-anchor="middle" fill="white"%3E🐷%3C/text%3E%3C/svg%3E',
            sizes: "152x152",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"%3E%3Crect width="192" height="192" rx="40" fill="%23667eea"/%3E%3Ctext x="96" y="120" font-size="72" text-anchor="middle" fill="white"%3E🐷%3C/text%3E%3C/svg%3E',
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 384 384"%3E%3Crect width="384" height="384" rx="80" fill="%23667eea"/%3E%3Ctext x="192" y="240" font-size="144" text-anchor="middle" fill="white"%3E🐷%3C/text%3E%3C/svg%3E',
            sizes: "384x384",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"%3E%3Crect width="512" height="512" rx="105" fill="%23667eea"/%3E%3Ctext x="256" y="320" font-size="192" text-anchor="middle" fill="white"%3E🐷%3C/text%3E%3C/svg%3E',
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any"
          },
        ],
        screenshots: [
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="540" height="720" viewBox="0 0 540 720"%3E%3Crect width="540" height="720" fill="%23f8f9fa"/%3E%3Crect x="20" y="80" width="500" height="60" rx="10" fill="%23667eea"/%3E%3Ctext x="270" y="115" font-size="20" text-anchor="middle" fill="white"%3E食費管理アプリ%3C/text%3E%3Crect x="20" y="160" width="240" height="120" rx="10" fill="%23e9ecef"/%3E%3Ctext x="140" y="225" font-size="16" text-anchor="middle" fill="%23495057"%3E支出記録%3C/text%3E%3Crect x="280" y="160" width="240" height="120" rx="10" fill="%23e9ecef"/%3E%3Ctext x="400" y="225" font-size="16" text-anchor="middle" fill="%23495057"%3E統計表示%3C/text%3E%3C/svg%3E',
            sizes: "540x720",
            type: "image/svg+xml",
            form_factor: "narrow"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/store": path.resolve(__dirname, "./src/store"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
