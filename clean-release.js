/* eslint-disable @typescript-eslint/no-var-requires */
const { rm } = require("node:fs/promises");
const { buildDir, releaseDir } = require("./paths");

(async () => {
  try {
    await rm(buildDir, { recursive: true });
    await rm(releaseDir, { recursive: true });
  } catch (e) {
    // skip
  }
})();
