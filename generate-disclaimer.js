import { join } from "node:path";
import { parseArgs } from "node:util";
import { readPackage } from "read-pkg";
import { readPackageUp } from "read-pkg-up";

console.assert(process.argv[2] === "generate-disclaimer");
const args = process.argv.slice(3);
/** @satisfies {import('node:util').ParseArgsConfig['options']} */
const options = {};
const { positionals, values } = parseArgs({ options, args, strict: false });

const pkg = await readPackageUp().then((x) => x.packageJson);
console.log(
  "THE FOLLOWING SETS FORTH ATTRIBUTION NOTICES FOR THIRD PARTY SOFTWARE THAT MAY BE CONTAINED " +
    `IN PORTIONS OF THE ${pkg.name.toUpperCase().replace(/-/g, " ")} PRODUCT.`,
);

const ls = await $`npm ls -ap`
  .then((c) => c.stdout)
  .then((t) => t.split(/\r?\n/g));
ls.shift();
let text = ""
for (const path of ls) {
  const tries = [
    join(path, "LICENSE"),
    join(path, "LICENSE.md")
  ]
}