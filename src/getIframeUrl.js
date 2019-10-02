'use strict';

function getIframeUrl(baseUrl) {
  return new URL(`iframe.html?eyes-storybook=true`, baseUrl).href;
}

module.exports = getIframeUrl;
