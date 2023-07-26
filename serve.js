#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { version, name } = require("../package.json");
const fs = require("fs-extra");
const path = require("path");
const { Listr } = require("listr2");
const execa = require("execa");

const main = () => {
  // parse cli arguments
  const { _, $0, ...options } = yargs(hideBin(process.argv))
    .scriptName(name)
    .usage("Usage: $0 <project name> [option]")
    .example("npx $0 jsbmc")
    .option("skip-install", {
      alias: "s",
      describe: "Skip the npm install step after copying the template",
    })
    .help()
    .version(version)
    .alias("h", "help")
    .alias("v", "version")
    .parse();


  // if skipInstall is true, skip dependencies installation step after creating, default to false
  const { skipInstall } = options;

  const tasks = new Listr(
    [
      
    ],
    {
      concurrent: false,
      exitOnError: true,
    }
  );

  return tasks
    .run()
    .then(() => {
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};

main();

