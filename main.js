#!/usr/bin/env node
import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { readPackageUp } from "read-pkg-up";
import { $ } from "execa";
import { readPackage } from "read-pkg";
import __consoleLogTree from "console-log-tree";
import ObjectGroupBy from "object.groupby";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const prettyTree = __consoleLogTree.parse.bind(__consoleLogTree);
import.meta.resolve ??= (s) => pathToFileURL(createRequire(import.meta.url).resolve(s))
const package_ = JSON.parse(
  await readFile(new URL(import.meta.resolve("./package.json")), "utf8"),
);

async function generateDisclaimer() {
  /** @satisfies {import('node:util').ParseArgsConfig['options']} */
  const options = {};
  const { positionals, values } = parseArgs({ options, args: process.argv.slice(3), strict: false });

  const pkg = await readPackageUp().then((x) => x.packageJson);
  console.log(
    "THE FOLLOWING SETS FORTH ATTRIBUTION NOTICES FOR THIRD PARTY SOFTWARE THAT MAY BE CONTAINED " +
      `IN PORTIONS OF THE ${pkg.name.toUpperCase().replace(/-/g, " ")} PRODUCT.`,
  );

  const ls = await $`npm ls --all --parseable`
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
}

async function ls() {
  console.warn(
    "'yarn-licenses ls' is deprecated. Please use 'yarn-licenses list'.",
  );
  await list()
}

async function list() {
  /** @satisfies {import('node:util').ParseArgsConfig['options']} */
  const options = {
    json: { type: "boolean", default: false },
  };
  const { positionals, values } = parseArgs({ options, args: process.argv.slice(3), strict: false });

  const pkg = await readPackageUp().then((x) => x.packageJson);
  if (!pkg.license) {
    if (values.json) {
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
  const ls = await $`npm ls --all --parseable`
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

  if (values.json) {
    // TODO
    throw new DOMException("not implemented", "NotSupportedError")
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
}

const subcommands = { "generate-disclaimer": generateDisclaimer, ls, list };
if (Object.hasOwn(subcommands, process.argv[2])) {
  await subcommands[process.argv[2]]();
} else {
  /** @satisfies {import('node:util').ParseArgsConfig['options']} */
  const options = {
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
  };
  const { positionals, values } = parseArgs({ options, allowPositionals: true });
  const helpText = `${package_.name} v${package_.version}
  
SUBCOMMANDS
  yarn-licenses list
  yarn-licenses generate-disclaimer
`;
  if (values.help) {
    console.log(helpText);
  } else if (values.version) {
    console.log(package_.version);
  } else {
    console.error("Unknown subcommand: %o", process.argv[2])
    console.error(helpText);
    process.exit(1)
  }
}
