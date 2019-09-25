'use strict';
const getIframeUrl = require('./getIframeUrl');

function getStoryUrl({name, kind, parameters}, baseUrl) {
  const variationUrlParam = parameters && parameters.eyes && parameters.eyes.variationUrlParam;
  const variation = variationUrlParam ? `&eyes-variation=${variationUrlParam}` : '';

  return `${getIframeUrl(baseUrl)}&selectedKind=${encodeURIComponent(
    kind,
  )}&selectedStory=${encodeURIComponent(name)}${variation}`;
}

module.exports = getStoryUrl;
