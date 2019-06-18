'use strict';

function getStoryTitle({name, kind, parameters}) {
  const variationUrlParam = parameters && parameters.eyes && parameters.eyes.variationUrlParam;
  const urlSuffix = variationUrlParam ? ` [${variationUrlParam}]` : '';

  return `${kind}: ${name}${urlSuffix}`;
}

module.exports = getStoryTitle;
