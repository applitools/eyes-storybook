const commonjs = require('rollup-plugin-commonjs');
const wrapBundle = require('./src/wrapBundle');

module.exports = ['getStories', 'renderStoryWithClientAPI', 'runRunBeforeScript'].map(config);

function config(fileName) {
  return {
    input: `src/browser/${fileName}`,
    output: {
      file: `dist/${fileName}`,
      format: 'iife',
      name: fileName,
    },
    plugins: [commonjs({include: '**', ignoreGlobal: true}), wrapBundle(fileName)],
  };
}
