'use strict';

function wrapBundle(filename) {
  return {
    generateBundle: function(_outputOptions, bundle) {
      const bundleFile = bundle[filename];

      bundleFile.code = `
function __${filename}(...args) {
  ${bundleFile.code}
  return ${filename}.apply(this, args);
}
module.exports = __${filename}
`;
    },
  };
}

module.exports = wrapBundle;
