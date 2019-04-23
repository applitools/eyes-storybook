'use strict';
const pick = require('lodash.pick');
const {ConfigUtils} = require('@applitools/eyes-common');
const {resolve} = require('path');

function generateConfig({argv = {}, defaultConfig = {}, externalConfigParams = []}) {
  const configPath = argv.conf ? resolve(process.cwd(), argv.conf) : undefined;
  const defaultConfigParams = Object.keys(defaultConfig);
  const configParams = uniq(defaultConfigParams.concat(externalConfigParams));
  const config = ConfigUtils.getConfig({configPath, configParams});
  const argvConfig = pick(argv, configParams);
  const result = Object.assign({}, defaultConfig, config, argvConfig);
  return result;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

module.exports = generateConfig;
