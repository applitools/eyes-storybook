'use strict';
const chalk = require('chalk');
const fs = require('fs');
const detect = require('detect-port');
const {version: packageVersion} = require('../package.json');
const startStorybookServer = require('./startStorybookServer');

async function validateAndPopulateConfig({config, logger}) {
  if (!config.apiKey) {
    const msg = `
${chalk.red('Environment variable APPLITOOLS_API_KEY is not set.')}
${chalk.green(`To fix:
1. Register for Applitools developer account at www.applitools.com/devreg
2. Get API key from menu
3. Set APPLITOOLS_API_KEY environment variable
  Mac/Linux: export APPLITOOLS_API_KEY=Your_API_Key_Here
  Windows: set APPLITOOLS_API_KEY=Your_API_Key_Here`)}`;
    throw new Error(msg);
  }

  const packageJsonPath = `${process.cwd()}/package.json`;
  const packageJson = fs.existsSync(packageJsonPath) ? require(packageJsonPath) : undefined;

  if (!config.appName) {
    if (!packageJson) {
      const msg = `
${chalk.red(
        `App name is not defined. Normally we would take it by default from the package.json file located at the root of your project (${process.cwd()}), but the package.json file wasn't found.`,
      )}

${chalk.green(`To set an "appName", do one of the following:
Option 1: specify "appName" in the eyes.json file that should be placed in the current working directory.
Option 2: set an environment variable APPLITOOLS_APP_NAME.
Option 3: have a package.json file in the current working directory that has a "name" property. We'll take it from there.`)}

`;
      throw new Error(msg);
    }

    if (!packageJson.name) {
      const msg = `
${chalk.red(
        `App name is not defined. Normally we would take it by default from the package.json file located at the root of your project (${process.cwd()}), but the package.json file doesn't have a "name" property.`,
      )}

${chalk.green(
        `To fix, add a "name" property to your package.json file located at ${process.cwd()}\n`,
      )}

`;
      throw new Error(msg);
    }

    config.appName = packageJson.name;
  }

  if (!config.batchName) {
    config.batchName = config.appName;
  }

  if (!config.storybookUrl) {
    try {
      config.storybookPort = await detect(config.storybookPort);
    } catch (ex) {
      console.log(chalk.red(`couldn't find available port around`, config.storybookPort));
    }

    config.storybookUrl = await startStorybookServer(
      Object.assign({packagePath: process.cwd(), logger}, config),
    );
  }

  config.storybookUrl = config.storybookUrl.replace(/\/$/, '');

  if (!config.storybookUrl) {
    console.info(
      chalk.red(
        'Could not find a storybook URL to test. This might be either because there was an error when starting the storybook dev server, or the parameter "storybookUrl" was not specified. Specify a URL with the "-u" parameter, or with "storybookUrl" in the config file (by default the config file is located at <project-folder>/applitools.config.js>).\n',
      ),
    );
    process.exit(1);
  }

  config.agentId = `eyes.storybook/${packageVersion}`;
}

module.exports = validateAndPopulateConfig;
