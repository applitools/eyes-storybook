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

if (!config.appName) {
  const packageJsonPath = `${process.cwd()}/package.json`;
  if (!fs.existsSync(packageJsonPath)) {
    console.log(
      chalk.red(
        `\nApp name is not defined. Normally we would take it by default from the package.json file located at the root of your project (${process.cwd()}), but the package.json file wasn't found.\n`,
      ),
    );
    console.log(
      chalk.green(
        `To set an "appName", do one of the following:
  Option 1: specify "appName" in the eyes.json file that should be placed in the current working directory.
  Option 2: set an environment variable APPLITOOLS_APP_NAME.
  Option 3: have a package.json file in the current working directory that has a "name" property. We'll take it from there.\n`,
      ),
    );
    process.exit(1);
  }
  const packageJson = require(packageJsonPath);
  if (!packageJson.name) {
    console.log(
      chalk.red(
        `\nApp name is not defined. Normally we would take it by default from the package.json file located at the root of your project (${process.cwd()}), but the package.json file doesn't have a "name" property.\n`,
      ),
    );
    console.log(
      chalk.green(
        `To fix, add a "name" property to your package.json file located at ${process.cwd()}\n`,
      ),
    );
    process.exit(1);
  }
  updateConfig({appName: packageJson.name});
}

// TODO fix config!!!!!
// if (!config.batchName) {
//   updateConfig({batchName: getConfig().appName});
// }

if (!cliOptions.url) {
  console.info(
    chalk.red('The parameter "URL" was not passed. Pass a URL with the "-u" parameter.\n'),
  );
  console.log(chalk.green('For example:\nnpx eyes-storybook -u http://localhost:9009'));
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
