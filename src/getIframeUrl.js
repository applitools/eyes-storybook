'use strict';

function getIframeUrl(baseUrl) {
  const baseUrlWithTrailingSlash = /\/$/.test(baseUrl) ? baseUrl : baseUrl + '/';
  return new URL(`iframe.html?eyes-storybook=true`, baseUrlWithTrailingSlash).href;
}

module.exports = getIframeUrl;
