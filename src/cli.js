'use strict';
const yargs = require('yargs');
const chalk = require('chalk');
const fs = require('fs');
const {resolve} = require('path');
const VERSION = require('../package.json').version;
const {initConfig} = require('@applitools/visual-grid-client');
const eyesStorybook = require('./eyesStorybook');
const processResults = require('./processResults');
const validateAndPopulateConfig = require('./validateAndPopulateConfig');
const yargsOptions = require('./yargsOptions');

const argv = yargs
  .usage('Usage: $0 [options]')
  .epilogue('Check our documentation here: https://applitools.com/resources/tutorial')
  .showHelpOnFail(false, 'Specify --help for available options')
  .version('version', 'Show the version number', `Version ${VERSION}`)
  .alias('version', 'v')
  .wrap(yargs.terminalWidth())
  .options(yargsOptions).argv;

console.log(`Using eyes.storybook version ${VERSION}.`);

/* --- Load configuration from config file --- */
const configPath = argv.conf ? resolve(process.cwd(), argv.conf) : undefined;
const {getConfig} = initConfig({configPath});
const config = getConfig();

try {
  validateAndPopulateConfig(config);
} catch (ex) {
  console.log(ex.message);
  process.exit(1);
}

if (!argv['storybook-url']) {
  console.info(
    chalk.red('The parameter "URL" was not passed. Pass a URL with the "-u" parameter.\n'),
  );
  console.log(chalk.green('For example:\nnpx eyes-storybook -u http://localhost:9009'));
  process.exit(1);
}

config.storybookUrl = argv.url.replace(/\/$/, '');

(async function() {
  const results = await eyesStorybook(config);
  const {exitCode, formatter, outputStr} = processResults(results);
  console.log(outputStr);

  if (config.tapFilePath) {
    const tapFilePath = resolve(process.cwd(), 'eyes.tap');
    fs.writeFileSync(tapFilePath, formatter.asHierarchicTAPString(false, true));
  }

  process.exit(exitCode);
})();
