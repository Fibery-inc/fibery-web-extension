import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";

config();
const { REMOTE_HOST, FIBERY_AUTH_TOKEN } = process.env;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Using the proxy instance
      "/api": {
        target: REMOTE_HOST,
        changeOrigin: true,
        headers: {
          Authorization: `Token ${FIBERY_AUTH_TOKEN}`,
        },
        configure: (proxy) => {
          proxy.on("proxyRes", function (proxyRes, req, res) {
            if (req.url === "/api/users/me") {
              res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8",
              });
              res.write(
                JSON.stringify({
                  email: "test@test.com",
                  workspaces: [{ name: req.headers.host, title: REMOTE_HOST }],
                })
              );
              res.end();
            }
          });
        },
      },
    },
  },
});
