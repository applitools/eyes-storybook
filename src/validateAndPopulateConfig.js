'use strict';
const chalk = require('chalk');
const fs = require('fs');
const detect = require('detect-port');
const {version: packageVersion} = require('../package.json');
const {
  missingApiKeyFailMsg,
  missingAppNameAndPackageJsonFailMsg,
  missingAppNameInPackageJsonFailMsg,
  startStorybookFailMsg,
} = require('./errMessages');
const startStorybookServer = require('./startStorybookServer');

async function validateAndPopulateConfig({config, packagePath, logger}) {
  if (!config.apiKey) {
    throw new Error(missingApiKeyFailMsg);
  }

  const packageJsonPath = `${packagePath}/package.json`;
  const packageJson = fs.existsSync(packageJsonPath) ? require(packageJsonPath) : undefined;

  if (!config.appName) {
    if (!packageJson) {
      throw new Error(missingAppNameAndPackageJsonFailMsg);
    }

    if (!packageJson.name) {
      throw new Error(missingAppNameInPackageJsonFailMsg);
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

    config.storybookUrl = await startStorybookServer(Object.assign({packagePath, logger}, config));

    if (!config.storybookUrl) {
      console.log(startStorybookFailMsg);
      process.exit(1);
    }
  }

  config.agentId = `eyes-storybook/${packageVersion}`;

  if (config.runInDocker) {
    config.puppeteerOptions = config.puppeteerOptions || {};
    config.puppeteerOptions.args = config.puppeteerOptions.args || [];
    if (!config.puppeteerOptions.args.includes('--disable-dev-shm-usage')) {
      config.puppeteerOptions.args.push('--disable-dev-shm-usage');
    }
  }
}

module.exports = validateAndPopulateConfig;
