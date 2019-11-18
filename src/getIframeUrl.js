'use strict';
const {URL} = require('url');

function getIframeUrl(baseUrl) {
  const {origin, pathname} = new URL(baseUrl);
  let baseUrlFixed = `${origin}${pathname}`;
  if (!/\/$/.test(baseUrlFixed)) {
    baseUrlFixed += '/';
  }
  return new URL(`iframe.html?eyes-storybook=true`, baseUrlFixed).href;
}

module.exports = getIframeUrl;
