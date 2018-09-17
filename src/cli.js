'use strict';
const yargs = require('yargs');
const chalk = require('chalk');
const fs = require('fs');
const {resolve} = require('path');
const VERSION = require('../package.json').version;
const {initConfig} = require('@applitools/visual-grid-client');
const eyesStorybook = require('./eyesStorybook');
const processResults = require('./processResults');

const cliOptions = yargs
  .usage('Usage: $0 [options]')
  .epilogue('Check our documentation here: https://applitools.com/resources/tutorial')
  .showHelpOnFail(false, 'Specify --help for available options')
  .version('version', 'Show the version number', `Version ${VERSION}`)
  .alias('version', 'v')
  .wrap(yargs.terminalWidth())
  .options({
    conf: {
      alias: 'f',
      description: 'Path to folder with eyes.json config file',
      default: '.',
      requiresArg: true,
      string: true,
    },

    url: {
      alias: 'u',
      description: 'URL to storybook',
      requiresArg: true,
      string: true,
    },

    // storybook options
    'start-server': {
      alias: 's',
      description: 'Whether to run a storybook dev server',
      requiresArg: false,
      boolean: true,
    },
    port: {
      alias: 'p',
      description: 'Port to run Storybook',
      requiresArg: false,
      number: true,
    },
    host: {
      alias: 'h',
      description: 'Host to run Storybook',
      requiresArg: false,
      string: true,
    },
    'config-dir': {
      alias: 'c',
      description: 'Directory where to load Storybook configurations from',
      requiresArg: true,
      string: true,
    },

    // general
    exitcode: {
      alias: 'e',
      description: 'If tests failed close with non-zero exit code',
      requiresArg: false,
      boolean: true,
    },
  }).argv;

/* --- Load configuration from config file --- */
console.log(`Used eyes.storybook of version ${VERSION}.`);
const configPath = resolve(process.cwd(), cliOptions.conf);
const {getConfig, updateConfig, getInitialConfig} = initConfig(configPath);
const config = getConfig();

if (!config.apiKey) {
  console.info(chalk.red('\nEnvironment variable APPLITOOLS_API_KEY is not set.'));
  console.info(chalk.green('\nTo fix:'));
  console.info(
    chalk.green('1. Register for Applitools developer account at www.applitools.com/devreg'),
  );
  console.info(chalk.green('2. Get API key from menu'));
  console.info(
    chalk.green(
      '3. Set APPLITOOLS_API_KEY environment variable\n' +
        'Mac/Linux: export APPLITOOLS_API_KEY=Your_API_Key_Here\n' +
        'Windows: set APPLITOOLS_API_KEY=Your_API_Key_Here',
    ),
  );
  process.exit(1);
}

if (!cliOptions.url) {
  console.info(chalk.red('url should be defined.'));
  process.exit(1);
}

(async function() {
  const url = cliOptions.url.replace(/\/$/, '');
  const results = await eyesStorybook(url, {getConfig, updateConfig, getInitialConfig});
  const {exitCode, formatter, outputStr} = processResults(results);
  console.log(outputStr);

  const tapFilePath = resolve(process.cwd(), 'eyes.tap');
  fs.writeFileSync(tapFilePath, formatter.asHierarchicTAPString(false, true));
  process.exit(exitCode);
})();
