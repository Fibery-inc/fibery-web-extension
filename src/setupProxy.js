require("dotenv").config();
const { createProxyMiddleware } = require("http-proxy-middleware");
const process = require("process");
const { REMOTE_HOST, FIBERY_AUTH_TOKEN } = process.env;
if (!REMOTE_HOST) {
  throw new Error(`Please specify REMOTE_HOST env variable`);
}
module.exports = function (app) {
  app.get("/api/users/me", async (req, res) => {
    res.json({
      email: "test@test.com",
      workspaces: [{ name: req.headers.host }],
    });
  });
  app.use(
    "/api",
    createProxyMiddleware({
      target: REMOTE_HOST,
      changeOrigin: true,
      headers: {
        Authorization: `Token ${FIBERY_AUTH_TOKEN}`,
      },
    })
  );
};
