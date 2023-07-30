#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs-extra");
const path = require("path");
const { Listr } = require("listr2");

const Module = require("./minisat");
const solve_string = Module.cwrap('solve_string', 'string', ['string', 'int']);

const { version, name } = require("./package.json");
const generateTestFile  = require('./generateTestFile');
const getFunctionInfo  = require('./getFunctionInfo');
const getRandomTestArray = require('./getTestVariables');
const runCommand = require('./runCommand');

  // jsbmc -p ./samples/string_sample.js  -f search_eel -n 10 -l 1 -u 300
  // jsbmc -p ./samples/string_sample.js  -f search_eel -n 10 -r "^[a-z]{9,20}eel[a-z]{0,11}$"  
  // jsbmc -p ./samples/number_sample.js  -f findSquareRoot -n 10 -r "^\d{1,100}$" 
  //jsbmc -p ./samples/number_sample.js  -f findSquareRoot -n 10 -l 1 -u 30
  // 
const main = async () => {
  const { _, ...options } = yargs(hideBin(process.argv))
    .scriptName(name)
    .usage("Usage: $0 ? [option]")
    .example("jsbmc $0 -p src/services/example.js -f nameOfFunction -n numberOfTestCases -l lowerBoundary -u upperBoundary (If you set lower or upper boundary) \n  jsbmc $0 -p src/services/example.js -f nameOfFunction -n numberOfTestCases -r regularExpression (If you set regular expression)")
    .option("path", {
      alias: "p",
      describe: "the path of JavaScript file",
    })
    .option("function", {
      alias: "f",
      describe: "name of JavaScript function",
    })
    .option("lower", {
      alias: "l",
      describe: "lower boundary",
    })
    .option("upper", {
      alias: "u",
      describe: "upper boundary",
    })
    .option("regex", {
      alias: "r",
      describe: "regular expression pattern",
    })
    .option("number", {
      alias: "n",
      describe: "number of test cases",
    })
    .option("sat", {
      alias: "s",
      describe: "check about SAT by passing cnf file",
    })
    .help("h")
    .alias("h", "help")
    .alias("v", "version")
    .version(version)
    .parse();

  const fileAddress = options.p;
  const functionName = options.f;
  const min = options.l;
  const max = options.u;
  const regex = options.r;
  const testNumber = options.n;
  const cnfFile = options.sat;



  if(typeof cnfFile != 'undefined'){
    const absCnfFile = path.resolve(process.cwd(), cnfFile);
    const isCnfFileExist = fs.existsSync(absCnfFile);
  
    // throw if file doesn't exist
    if (!isCnfFileExist) {
      console.log(`Error: SAT CNF File does not exist`);
      console.log();
      console.log(`Path '${absCnfFile}' does not exist`);
      process.exit(1);
    }

    tasks = new Listr(
      [
        {
          title: "Verify SAT by MiniSAT",
          task: () => {
            try{
              const cnfContent = fs.readFileSync(cnfFile, 'utf8');
              const result = solve_string(cnfContent, cnfContent.length);
              console.log("Result: " + result + "\n");
            }catch (err) {
                console.log(err);
                process.exit(1);
              }
          },
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
  }
  

  if(typeof fileAddress != 'undefined')
  {
      const absFileAddress = path.resolve(process.cwd(), fileAddress);
      
      const isFileExist = fs.existsSync(absFileAddress);
      // throw if file doesn't exist
      if (!isFileExist) {
        console.log(`Error: File does not exist`);
        console.log();
        console.log(`Path '${absFileAddress}' does not exist`);
        process.exit(1);
      }



      tasks = new Listr(
        [
          {
            title: "Load JavaScript function",
            task: () => {
              if(typeof functionName == 'undefined'){
                console.log("Failed to load JavaScript function");
                process.exit(1);
              }
            },
          },
          {
            title:
              "Starting Bounded Model Checking",
              task: async () => {
                try {
                  const functionInfo = getFunctionInfo(fileAddress, "check");
                  const getFunctions = require(fileAddress);
                  const exportedFunctions = Object.keys(getFunctions);
                
                  if(functionInfo.length > 0){
                    let argumentType = functionInfo[0].parameters[0];
                    let codeBody = functionInfo[0].code;
                    let testCasesVariables = getRandomTestArray(argumentType, testNumber, min, max, regex);
                    generateTestFile('../'+fileAddress, functionName, codeBody, testCasesVariables, argumentType, exportedFunctions);
                
                  }
                  else{
                    throw new Error(`Function "${functionName}" not found in the file.`);
                  }
                
                  await runCommand('npm.cmd', 'test');
                } catch (err) {
                  console.log("Bounded Model Checking NOT successfully");
                  process.exit(1);
                }
              },
          },
          {
            title: "Remove Test files",
            task: () => {
              try{
                fs.rmdirSync('./__tests__/', { recursive: true });
              }catch (err) {
                  console.log("Remove Test files Failed");
                  process.exit(1);
                }
            },
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
  }

  return tasks
    .run()
    .then((ctx) => {
      console.log();
      console.log("⚡️ Bounded Model Checking completed");
      process.exit(0);
    })
    .catch((err) => {
      console.log("Error happened during Bounded Model Checking");
      console.log(err);
      process.exit(1);
    });
};

main();
