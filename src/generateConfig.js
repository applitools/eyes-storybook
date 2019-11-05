'use strict';
const pick = require('lodash.pick');
const {ConfigUtils} = require('@applitools/eyes-sdk-core');
const {resolve} = require('path');

function generateConfig({argv = {}, defaultConfig = {}, externalConfigParams = []}) {
  const configPath = argv.conf ? resolve(process.cwd(), argv.conf) : undefined;
  const defaultConfigParams = Object.keys(defaultConfig);
  const configParams = uniq(defaultConfigParams.concat(externalConfigParams));
  const config = ConfigUtils.getConfig({configPath, configParams});
  const argvConfig = pick(argv, configParams);
  const result = Object.assign({}, defaultConfig, config, argvConfig);
  if (
    typeof result.waitBeforeScreenshots === 'string' &&
    !isNaN(parseInt(result.waitBeforeScreenshots))
  ) {
    result.waitBeforeScreenshots = Number(result.waitBeforeScreenshots);
  }

  if (
    result.storyDataGap === undefined &&
    result.concurrency !== undefined &&
    result.renderConcurrencyFactor !== undefined
  ) {
    result.storyDataGap = result.concurrency * result.renderConcurrencyFactor;
  }
  return result;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

module.exports = generateConfig;
