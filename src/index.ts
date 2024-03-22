import { execSync } from "node:child_process";
import { mkdtemp, mkdir } from "fs/promises";
import { tmpdir } from "node:os";

import { build } from "tsup";

(async () => {
  const dir = await mkdir(`temp/kysely-${Date.now()}`, {
    recursive: true,
  });
  await execSync(`git clone https://github.com/woltsu/tsynamo ${dir}`);

  execSync(`cd "${dir}" && pnpm i`);

  await mkdir("dist/main", { recursive: true });
  await build({
    entry: [`${dir}/src/index.ts`],
    format: ["cjs", "esm"],
    minify: true,
    treeshake: true,
    dts: true,
    tsconfig: `${dir}/tsconfig.json`,
    sourcemap: false,
    // Include these packages to the bundle instead of expecting them to be importable from node_modules
    noExternal: ["@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb"],
    platform: "browser",
    outDir: "dist/main",
  });
})();
