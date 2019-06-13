'use strict';

function getStoryUrl({name, kind}, baseUrl) {
  return `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
    kind,
  )}&selectedStory=${encodeURIComponent(name)}&eyes-storybook=true`;
}

module.exports = getStoryUrl;
