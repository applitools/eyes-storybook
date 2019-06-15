'use strict';

function getStoryTitle({name, kind, parameters}) {
  const rtlSuffix = parameters && parameters.eyes && parameters.eyes.shouldAddRTL ? ' [RTL]' : '';
  return `${kind}: ${name}${rtlSuffix}`;
}

module.exports = getStoryTitle;
