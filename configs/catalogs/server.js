console.clear();
const { spawn } = require("child_process");
const express = require("express");
const app = express();
const chalk = require('chalk');
const logger = require("./system-settings/console/console-logger.js");
const path = require('path');
const PORT = process.env.PORT || 8080;

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});
console.clear();
function startBot(message) {
    (message) ? logger(message, "starting") : "";
  logger.loader(`deploying app on port ${chalk.blueBright(PORT)}`);
  app.listen(logger.loader(`app deployed on port ${chalk.blueBright(PORT)}`));
  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "system.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });
  child.on("close", (codeExit) => {
        if (codeExit != 0 || global.countRestart && global.countRestart < 5) {
            startBot();
            global.countRestart += 1;
            return;
        } else return;
    });

  child.on("error", function(error) {
    logger("an error occurred : " + JSON.stringify(error), "error");
  });
};
startBot();
