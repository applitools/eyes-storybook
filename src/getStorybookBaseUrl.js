'use strict';
const {URL} = require('url');

function getStorybookBaseUrl(storybookUrl) {
  const {origin, pathname} = new URL(storybookUrl);
  return `${origin}${pathname}`.replace(/\/$/, '');
}

module.exports = getStorybookBaseUrl;
