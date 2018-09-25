'use strict';
const yargs = require('yargs');
const fs = require('fs');
const {resolve} = require('path');
const VERSION = require('../package.json').version;
const {makeGetConfig} = require('@applitools/visual-grid-client');
const eyesStorybook = require('./eyesStorybook');
const processResults = require('./processResults');
const validateAndPopulateConfig = require('./validateAndPopulateConfig');
const yargsOptions = require('./yargsOptions');
const defaultConfig = require('./defaultConfig');

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
const getConfig = makeGetConfig({configPath});
const config = Object.assign({}, defaultConfig, getConfig(), argv); // TODO pick only configParams (on both getConfig and argv)

(async function() {
  try {
    await validateAndPopulateConfig(config);
    const results = await eyesStorybook(config);
    const {exitCode, formatter, outputStr} = processResults(results);
    console.log(outputStr);

    if (config.tapFilePath) {
      const tapFilePath = resolve(process.cwd(), 'eyes.tap');
      fs.writeFileSync(tapFilePath, formatter.asHierarchicTAPString(false, true));
    }

    process.exit(exitCode);
  } catch (ex) {
    console.log(ex.message);
    process.exit(1);
  }
})();
