import { execSync } from "node:child_process";
import { mkdtemp, mkdir } from "fs/promises";
import { tmpdir } from "node:os";

import { build } from "tsup";

(async () => {
  const workDir = `temp/kysely-${Date.now()}`;
  await mkdir(workDir, {
    recursive: true,
  });
  await execSync(`git clone https://github.com/woltsu/tsynamo ${workDir}`);

  execSync(`cd "${workDir}" && pnpm i`);

  await mkdir("dist/main", { recursive: true });
  await build({
    entry: [`${workDir}/src/index.ts`],
    format: ["cjs", "esm"],
    minify: true,
    treeshake: true,
    dts: true,
    tsconfig: `${workDir}/tsconfig.json`,
    sourcemap: false,
    // Include these packages to the bundle instead of expecting them to be importable from node_modules
    noExternal: ["@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb"],
    platform: "browser",
    outDir: "dist/main",
  });
})();
