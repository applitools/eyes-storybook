'use strict';
const {resolve} = require('path');
const {spawn} = require('child_process');
const ora = require('ora');

async function startStorybookServer({
  packagePath,
  storybookPort,
  storybookHost,
  storybookConfigDir,
  storybookStaticDir,
  showStorybookOutput,
  logger,
}) {
  const isWindows = process.platform.startsWith('win');
  const storybookPath = resolve(
    packagePath,
    `node_modules/.bin/start-storybook${isWindows ? '.cmd' : ''}`,
  );

  const args = ['-p', storybookPort, '-h', storybookHost, '-c', storybookConfigDir];
  if (storybookStaticDir) {
    args.push('-s');
    args.push(storybookStaticDir);
  }

  logger.log(`${storybookPath} ${args.join(' ')}`);
  const spinner = ora('Starting storybook server');
  spinner.start();

  const childProcess = spawn(storybookPath, args, {detached: !isWindows});

  if (showStorybookOutput) {
    // eslint-disable-next-line no-console
    childProcess.stderr.on('data', data =>
      console.error('start-storybook (stderr):', bufferToString(data)),
    );
    // eslint-disable-next-line no-console
    childProcess.stdout.on('data', data =>
      console.log('start-storybook (stdout):', bufferToString(data)),
    );
  }

  process.on('exit', () => {
    try {
      if (isWindows) {
        spawn('taskkill', ['/pid', childProcess.pid, '/f', '/t']);
      } else {
        process.kill(-childProcess.pid);
      }
    } catch (e) {
      logger.log("Can't kill child (Storybook) process.", e);
    }
  });

  process.on('SIGINT', () => process.exit());
  process.on('SIGTERM', () => process.exit());
  process.on('uncaughtException', () => process.exit(1));

  await waitForStorybook(childProcess);
  spinner.success('Storybook was started');
  return `http://${storybookHost}:${storybookPort}`;

  function waitForStorybook(childProcess) {
    return new Promise((resolve, reject) => {
      childProcess.stdout.on('data', webpackBuiltListener);
      childProcess.stderr.on('data', portBusyListener);

      // Set up the timeout
      setTimeout(() => reject("Storybook din't start after 5 min waiting."), 5 * 60 * 1000); // 5 min

      function portBusyListener(data) {
        if (bufferToString(data).includes('Error: listen EADDRINUSE')) {
          reject(new Error('Storybook port already in use: ', storybookPort));
        }
      }

      function webpackBuiltListener(data) {
        if (bufferToString(data).includes('webpack built')) {
          resolve();
        }
      }
    });
  }
}

function bufferToString(data) {
  return data.toString('utf8').trim();
}

module.exports = startStorybookServer;
