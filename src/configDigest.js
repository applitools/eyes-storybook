'use strict';
const {TypeUtils} = require('@applitools/eyes-sdk-core');
const prettyValue = val => (!TypeUtils.isObject(val) ? val : JSON.stringify(val));

function configDigest(config) {
  const maxKeyLen = Object.keys(config).reduce((len, key) => Math.max(len, key.length), 0);
  return (
    Object.entries(config)
      .map(([key, value]) => `${key.padEnd(maxKeyLen + 1)}: ${prettyValue(value)}`)
      .join('\n') + '\n'
  );
}

module.exports = configDigest;
