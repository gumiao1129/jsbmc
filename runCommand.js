const { spawnSync } = require('child_process');

function runCommand(command, options) {
    const result = spawnSync(command, [options], { stdio: 'inherit' });

    if (result.error) {
      console.error(`Error occurred: ${result.error.message}`);
      return;
    }

    if (result.status !== 0) {
      console.error(`${command} ${options} process exited with code ${result.status}.`);
    } else {
      console.log(`${command} ${options} completed successfully.`);
    }
  }

  module.exports = runCommand;