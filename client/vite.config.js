import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          antd: ["antd", "@ant-design/icons"],
          ui: ["framer-motion", "lucide-react"],
          utils: ["axios", "moment", "date-fns"],
          charts: ["recharts"],
          leaflet: ["leaflet", "react-leaflet"]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  base: "/",
})
