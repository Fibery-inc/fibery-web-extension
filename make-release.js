/* eslint-disable @typescript-eslint/no-var-requires */
const { cp, readFile, writeFile, mkdir } = require("node:fs/promises");
const { createWriteStream } = require("node:fs");
const { join } = require("node:path");
const globby = require("globby");
const yazl = require("yazl");
const { buildDir, releaseDir, chromeDist, firefoxDist } = require("./paths");

function archiveFiles({ files, dest, cwd }) {
  return new Promise((resolve) => {
    const archive = new yazl.ZipFile();
    files.forEach((file) =>
      archive.addFile(
        file,
        file.startsWith(`${cwd}/`) ? file.substring(cwd.length + 1) : file
      )
    );
    archive.outputStream
      .pipe(createWriteStream(dest))
      .on("close", () => resolve());
    archive.end();
  });
}

async function archiveDirectory({ dir, dest }) {
  const files = await globby(`${dir}/**/*.*`);
  await archiveFiles({ files, dest, cwd: dir });
}

async function zip() {
  await archiveDirectory({
    dir: chromeDist,
    dest: join(releaseDir, "./chrome.zip"),
  });
  await archiveDirectory({
    dir: firefoxDist,
    dest: join(releaseDir, "./firefox.zip"),
  });
}

(async () => {
  await mkdir(releaseDir, { recursive: true });
  await mkdir(chromeDist, { recursive: true });
  await mkdir(firefoxDist, { recursive: true });
  const copyOpts = { recursive: true };
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
  await zip();
})();
