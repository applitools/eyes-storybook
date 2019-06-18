'use strict';

function getStoryUrl({name, kind, parameters}, baseUrl) {
  const variationUrlParam = parameters && parameters.eyes && parameters.eyes.variationUrlParam;
  const variation = variationUrlParam ? `&eyes-variation=${variationUrlParam}` : '';

  return `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
    kind,
  )}&selectedStory=${encodeURIComponent(name)}&eyes-storybook=true${variation}`;
}

module.exports = getStoryUrl;
