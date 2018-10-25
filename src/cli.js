'use strict';
const yargs = require('yargs');
const fs = require('fs');
const {resolve} = require('path');
const createLogger = require('@applitools/visual-grid-client/src/sdk/createLogger');
const VERSION = require('../package.json').version;
const eyesStorybook = require('./eyesStorybook');
const processResults = require('./processResults');
const validateAndPopulateConfig = require('./validateAndPopulateConfig');
const yargsOptions = require('./yargsOptions');
const generateConfig = require('./generateConfig');
const defaultConfig = require('./defaultConfig');
const configDigest = require('./configDigest');
const {makeTiming} = require('@applitools/monitoring-commons');
const {performance, timeItAsync} = makeTiming();

(async function() {
  try {
    const argv = yargs
      .usage('Usage: $0 [options]')
      .epilogue('Check our documentation here: https://applitools.com/resources/tutorial')
      .showHelpOnFail(false, 'Specify --help for available options')
      .version('version', 'Show the version number', `Version ${VERSION}`)
      .alias('version', 'v')
      .wrap(yargs.terminalWidth())
      .options(yargsOptions).argv;

    console.log(`Using @applitools/eyes.storybook version ${VERSION}.\n`);

    const config = generateConfig({argv, defaultConfig});
    const logger = createLogger(config.showLogs);
    await validateAndPopulateConfig({config, logger});
    logger.log(`Running with the following config:\n${configDigest(config)}`);
    const results = await timeItAsync('eyesStorybook', () =>
      eyesStorybook({config, logger, performance, timeItAsync}),
    );
    const {exitCode, formatter, outputStr} = processResults(results, performance['eyesStorybook']);
    console.log(outputStr);

    if (config.tapFilePath) {
      const tapFilePath = resolve(process.cwd(), 'eyes.tap');
      fs.writeFileSync(tapFilePath, formatter.asHierarchicTAPString(false, true));
    }

    process.exit(config.exitcode ? exitCode : 0);
  } catch (ex) {
    console.log(ex.message);
    process.exit(1);
  }
})();
