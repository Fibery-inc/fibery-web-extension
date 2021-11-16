/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require("node:path");
const buildDir = join(__dirname, "./dist");
const releaseDir = join(__dirname, "./release");
const chromeDist = join(releaseDir, "./chrome");
const firefoxDist = join(releaseDir, "./firefox");
module.exports = {
  buildDir,
  releaseDir,
  chromeDist,
  firefoxDist,
};
