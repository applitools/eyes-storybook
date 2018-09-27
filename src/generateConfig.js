'use strict';
const pick = require('lodash.pick');
const {makeGetConfig} = require('@applitools/visual-grid-client');
const {resolve} = require('path');

function generateConfig({argv = {}, defaultConfig}) {
  const configPath = argv.conf ? resolve(process.cwd(), argv.conf) : undefined;
  const configParams = Object.keys(defaultConfig);
  const getConfig = makeGetConfig({configPath, configParams});

  const argvConfig = pick(argv, configParams);
  return Object.assign({}, defaultConfig, getConfig(), argvConfig);
}

module.exports = generateConfig;
