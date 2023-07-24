#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs-extra");
const path = require("path");
const { Listr } = require("listr2");
const fetch = require("node-fetch");
const { version, name } = require("./package.json");

const main = async () => {
  const { _, ...options } = yargs(hideBin(process.argv))
    .scriptName(name)
    .usage("Usage: $0 ? [option]")
    .example("jsbmc $0 -p src/services/example.js -f nameOfFunction")
    .option("path", {
      alias: "p",
      describe: "the path of JavaScript file",
    })
    .option("function", {
      alias: "f",
      describe: "name of JavaScript function",
    })
    .help("h")
    .alias("h", "help")
    .alias("v", "version")
    .version(version)
    .parse();

  const projectFolder = _[0] || ".";

  const projectDir = path.resolve(process.cwd(), projectFolder);
  const isFileExist = fs.existsSync(projectDir);
 
  // throw if project folder doesn't exist
  if (!isFileExist) {
    console.log(`Error: Project path does not exist`);
    console.log();
    console.log(`Path '${projectDir}' does not exist`);
    process.exit(1);
  }

  // create a folder to generate object classes
  const objectFolder = options.path || "src/services/objects";
  const objectDir = path.resolve(process.cwd(), objectFolder);
  fs.ensureDirSync(objectDir);

  const { serve, close, HOST } = require("./server");
  const tasks = new Listr(
    [
      {
        title: "Load JavaScript function",
        task: async () => {
          try {
            await `````````serve`````````(objectDir);
          } catch (err) {
            console.log("Failed to load JavaScript function");
            process.exit(1);
          }
        },
      },
      {
        title:
          "Starting Bounded Model Checking",
        task: () => startBoundModelCheck(), // TO-DO
      },
      {
        title: "Runtime decision procedure",
        task: () => close(),
      },
    ],
    {
      concurrent: false,
      exitOnError: true,
      ctx: {
        schema: "",
        classes: [],
      },
    }
  );

  return tasks
    .run()
    .then((ctx) => {
      console.log();
      console.log("⚡️ Introspection completed");
      console.log(`🐶 ${ctx.classes.length} object classes written to:`);
      console.log("\t", objectDir);
      process.exit(0);
    })
    .catch((err) => {
      console.log("Error happened during introspection");
      console.log(err);
      process.exit(1);
    });
};

/** Periodically check if a task if a task is finished */
const checkTaskProgress = async (host, task, interval = 200) => {
  return new Promise((resolve, reject) => {
    const ping = setInterval(() => {
      fetchTaskProgress(host, task).then(({ finished, error, data }) => {
        if (finished === true) {
          clearInterval(ping);

          if (error) {
            reject(error);
            return;
          }
          resolve(data);
        }
      });
    }, interval);
  });
};

const fetchTaskProgress = async (host, task) => {
  const res = await fetch(`${host}/status/${task}`);
  const response = await res.json();
  if (res.ok) {
    return response;
  } else {
    throw new Error(response.message);
  }
};

main();
