'use strict';

const fs = require('fs');
const {resolve} = require('path');

function handleTapFile(tapFilePath, formatter) {
  const path = resolve(tapFilePath, 'eyes.tap');
  fs.writeFileSync(path, formatter.asHierarchicTAPString(false, true));
  return path;
}

module.exports = handleTapFile;
