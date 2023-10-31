import { parseArgs } from "node:util";
import { readPackageUp } from "read-pkg-up";
import { $ } from "execa";
import { readPackage } from "read-pkg";
import __consoleLogTree from "console-log-tree";
import ObjectGroupBy from "object.groupby";
const prettyTree = __consoleLogTree.parse.bind(__consoleLogTree);

console.assert(process.argv[2] === "list");
const args = process.argv.slice(3);
/** @satisfies {import('node:util').ParseArgsConfig['options']} */
const options = {
  json: { type: "boolean", default: false },
};
const { positionals, values } = parseArgs({ options, args, strict: false });
const fmt = values.json ? "json" : "text";

const pkg = await readPackageUp().then((x) => x.packageJson);
if (!pkg.license) {
  if (fmt === "json") {
    console.warn(
      JSON.stringify({
        type: "warning",
        data: "package.json: No license field",
      }),
    );
    console.warn(
      JSON.stringify({
        type: "warning",
        data: `${pkg.name}: No license field`,
      }),
    );
  } else {
    console.warn("package.json: No license field");
    console.warn(`${pkg.name}: No license field`);
  }
}
const ls = await $`npm ls -ap`
  .then((c) => c.stdout)
  .then((t) => t.split(/\r?\n/g));
ls.shift();
/** @type {{ name: string, version: string, license: string, url: string, vendorURL: string, vendorName: string }[]} */
const table = [];
for (const path of ls) {
  const pkg = await readPackage({ cwd: path });
  table.push({
    name: pkg.name,
    version: pkg.version,
    license: pkg.license || "UNKNOWN",
    url: pkg.repository?.url ?? pkg.homepage,
    vendorName: pkg.author?.name,
    vendorURL: pkg.homepage ?? pkg.author?.url,
  });
}

if (fmt === "json") {
  // TODO
} else {
  const grouped = ObjectGroupBy(table, (x) => x.license);
  const tree = { name: "", children: [] };
  for (const [license, items] of Object.entries(grouped)) {
    const children = items.map((x) => ({
      name: `${x.name}@${x.version}`,
      children: [
        { name: `URL: ${x.url}` },
        { name: `VendorName: ${x.vendorName}` },
        { name: `VendorUrl: ${x.vendorURL}` },
      ],
    }));
    tree.children.push({ name: license, children });
  }
  console.log(prettyTree(tree));
}
