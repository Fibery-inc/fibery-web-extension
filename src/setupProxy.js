require("dotenv").config({ silent: true });
const { createProxyMiddleware } = require("http-proxy-middleware");
const process = require("process");
const { REMOTE_HOST = ``, FIBERY_AUTH_TOKEN } = process.env;
module.exports = function (app) {
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
