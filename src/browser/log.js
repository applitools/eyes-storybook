'use strict';

function log() {
  console.log.apply(console, ['[eyes-storybook]'].concat(Array.from[arguments]));
}

module.exports = log;
