'use strict';

function getStoryUrl({name, kind, parameters}, baseUrl) {
  const rtlParam = parameters && parameters.eyes && parameters.eyes.shouldAddRTL ? '&rtl=true' : '';
  return `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
    kind,
  )}&selectedStory=${encodeURIComponent(name)}&eyes-storybook=true${rtlParam}`;
}

module.exports = getStoryUrl;
