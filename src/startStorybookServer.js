'use strict';
const {resolve} = require('path');
const {spawn} = require('child_process');
const ora = require('ora');
const fs = require('fs');
const path = require('path');

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
  const storybookPackage = fs.readFileSync(
    path.resolve(packagePath, 'node_modules/@storybook/core/package.json'),
    'utf8',
  );
  const storybookVersion = JSON.parse(storybookPackage).version;

  const args = getVersionContext(storybookVersion).args(
    storybookPort,
    storybookHost,
    storybookConfigDir,
  );
  if (storybookStaticDir) {
    args.push('-s');
    args.push(storybookStaticDir);
  }

  logger.log(`${storybookPath} ${args.join(' ')}`);
  const spinner = ora('Starting storybook server');
  spinner.start();

  const childProcess = spawn(storybookPath, args, {detached: !isWindows});

  if (showStorybookOutput) {
    childProcess.stderr.on('data', data =>
      console.error('start-storybook (stderr):', bufferToString(data)),
    );
    childProcess.stdout.on('data', data =>
      console.log('start-storybook (stdout):', bufferToString(data)),
    );
  }

  childProcess.on('exit', code => {
    if (code) {
      spinner.fail('Failed to start storybook server');
      process.exit(1);
    }
  });

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

  await waitForStorybook(childProcess, storybookVersion);
  spinner.succeed('Storybook was started');
  return `http://${storybookHost}:${storybookPort}`;
}

function waitForStorybook(childProcess, version) {
  return new Promise((resolve, reject) => {
    childProcess.stdout.on('data', stdoutListener);
    childProcess.stderr.on('data', portBusyListener);

    // Set up the timeout
    const timeout = setTimeout(
      () => reject("Storybook din't start after 5 min waiting."),
      5 * 60 * 1000,
    ); // 5 min

    function portBusyListener(data) {
      if (bufferToString(data).includes('Error: listen EADDRINUSE')) {
        clearTimeout(timeout);
        reject(new Error('Storybook port already in use: '));
      }
    }

    function stdoutListener(data) {
      const readyString = getVersionContext(version).readyString;
      if (bufferToString(data).includes(readyString)) {
        clearTimeout(timeout);
        resolve();
      }
    }
  });
}

function bufferToString(data) {
  return data.toString('utf8').trim();
}

function getVersionContext(version) {
  const Latest = 5;
  const RoadBlocks = [
    {
      _untilVersion: 3,
      readyString: 'webpack built',
      args: (storybookPort, storybookHost, storybookConfigDir) => [
        '-p',
        storybookPort,
        '-h',
        storybookHost,
        '-c',
        storybookConfigDir,
      ],
    },
    {
      _untilVersion: 4,
      readyString: `Storybook ${version} started`,
      args: (storybookPort, storybookHost, storybookConfigDir) => [
        '-p',
        storybookPort,
        '-h',
        storybookHost,
        '-c',
        storybookConfigDir,
        '--ci',
      ],
    },
  ];

  let m = version && version.match(/(\d+)\./);
  m = (m && m[1]) || Latest;
  return RoadBlocks.find(c => c._untilVersion >= m) || RoadBlocks[RoadBlocks.length - 1];
}

module.exports = {startStorybookServer, waitForStorybook};
