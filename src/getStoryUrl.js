'use strict';

function getStoryUrl({name, kind}, baseUrl) {
  return `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
    kind,
  )}&selectedStory=${encodeURIComponent(name)}`;
}

module.exports = getStoryUrl;
