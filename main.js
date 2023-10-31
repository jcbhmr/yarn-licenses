#!/usr/bin/env node
import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import.meta.resolve ??= (s) => new URL(s, import.meta.url).href;
const meta = JSON.parse(
  await readFile(new URL(import.meta.resolve("./package.json")), "utf8"),
);

const subcommands = {
  async ls() {
    console.warn(
      "'yarn-licenses ls' is deprecated. Please use 'yarn-licenses list'.",
    );
    await import("./list.js");
  },
  list: () => import("./list.js"),
  "generate-disclaimer": () => import("./generate-disclaimer.js"),
};
if (Object.hasOwn(subcommands, process.argv[2])) {
  await subcommands[process.argv[2]]();
} else {
  /** @satisfies {import('node:util').ParseArgsConfig['options']} */
  const options = {
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
  };
  const { positionals, values } = parseArgs({ options });
  const helpText = `${meta.name} v${meta.version}
  
SUBCOMMANDS
  yarn-licenses list
  yarn-licenses generate-disclaimer
`;
  if (values.help) {
    console.log(helpText);
  } else if (values.version) {
    console.log(meta.version);
  } else {
    console.log(helpText);
    process.exitCode = 1;
  }
}
