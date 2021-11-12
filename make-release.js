const { cp, readFile, writeFile } = require("node:fs/promises");
const { join } = require("node:path");
const { execSync } = require("node:child_process");
const buildDir = join(__dirname, "./build");
const releaseDir = join(__dirname, "./release");
const chromeDist = join(releaseDir, "./chrome");
const firefoxDist = join(releaseDir, "./firefox");
const filterFiles = (f) => {
  return !f.includes("asset-manifest");
};
(async () => {
  const copyOpts = { recursive: true, filter: filterFiles };
  await cp(buildDir, chromeDist, copyOpts);
  await cp(buildDir, firefoxDist, copyOpts);
  const manifest = JSON.parse(
    (await readFile(join(chromeDist, "./manifest.json"))).toString()
  );
  const ffManifest = Object.fromEntries(
    Object.entries(manifest)
      .map(([key, value]) => {
        if (key === "manifest_version") {
          return [key, 2];
        }
        if (key === "commands") {
          return [
            key,
            {
              _execute_browser_action: value["_execute_action"],
            },
          ];
        }
        if (key === "action") {
          return ["browser_action", value];
        }
        if (key === "permissions") {
          return [
            key,
            value
              .filter((v) => v !== "scripting")
              .concat(manifest["host_permissions"]),
          ];
        }
        if (key === "host_permissions") {
          return null;
        }
        return [key, value];
      })
      .concat(
        process.env.DEV_EXTENSION_ID
          ? [
              [
                "browser_specific_settings",
                {
                  gecko: {
                    id: `{daf44bf7-a45e-4450-979c-91cf07434c3d}`,
                    strict_min_version: "42.0",
                  },
                },
              ],
            ]
          : null
      )
      .filter(Boolean)
  );
  await writeFile(
    join(firefoxDist, "./manifest.json"),
    JSON.stringify(ffManifest, null, 2)
  );
  execSync(`cd ./release/chrome && zip -r ../chrome.zip *`);
  execSync(`cd ./release/firefox && zip -r ../firefox.zip *`);
})();
