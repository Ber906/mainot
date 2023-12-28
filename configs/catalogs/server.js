const { spawn } = require("child_process");
const express = require("express");
const app = express();
const logger = require("./system-settings/console/console-logger.js");
const path = require('path');
const net = require('net');
const chalk = require('chalk');
const pkg = require('../../package.json');
const axios = require('axios');

const getRandomPort = () => Math.floor(Math.random() * (65535 - 1024) + 1024);
const PORT = getRandomPort();
let currentPort = PORT;
const REPL_HOME = `https://ainz-dev.onrender.com`.toLowerCase();

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/', (req, res) => res.sendStatus(200));

setInterval(uptime, 1000);

function uptime() {
  axios.get(REPL_HOME).then(() => {}).catch(() => {});
}

  console.clear();
  console.log(chalk.bold.dim(`ainz-dev`.toUpperCase() + `(v${pkg.version})`));
  logger(`Getting Started!`, "STARTER");
  startBot(0);

  async function isPortAvailable(port) {
    return new Promise((resolve) => {
      const tester = net.createServer()
        .once('error', () => resolve(false))
        .once('listening', () => {
          tester.once('close', () => resolve(true)).close();
        })
        .listen(port, '127.0.0.1');
    });
  }

  function startServer(port) {
    app.listen(port, () => {
      logger.loader(`Bot is running on port: ${port}`);
      logger.loader(`Activating uptime for ${chalk.underline(`'${REPL_HOME}'`)}`, 'SYSTEM');
    });

    app.on('error', (error) => {
      logger(`An error occurred while starting the server: ${error}`, "SYSTEM");
    });
  }

// # Please note that sometimes this function is the reason the bot will auto-restart, even if your custom.js auto-restart is set to false. This is because the port switches automatically if it is unable to connect to the current port. ↓↓↓↓↓↓

  async function startBot(index) {
    try {
      const isAvailable = await isPortAvailable(currentPort);
      if (!isAvailable) {
        logger(`Retrying...`, "SYSTEM");
        const newPort = getRandomPort();
        logger.loader(`Current port ${currentPort} is not available. Switching to new port ${newPort}.`);
        currentPort = newPort;
      }
      
      startServer(currentPort);

      const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "system.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true,
        env: {
          ...process.env,
          CHILD_INDEX: index,
        },
      });

      child.on("close", (codeExit) => {
        if (codeExit !== 0) {
          startBot(index);
        }
      });

      child.on("error", (error) => {
        logger(`An error occurred while starting the child process: ${error}`, "SYSTEM");
      });
    } catch (err) {
      logger(`Error while starting the bot: ${err}`, "SYSTEM");
    }
  }
