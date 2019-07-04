'use strict';
const url = require('url');

function getStorybookBaseUrl(storybookUrl) {
  const {host, protocol, pathname} = url.parse(storybookUrl);
  return `${protocol}//${host}${pathname}`.replace(/\/$/, '');
}

module.exports = getStorybookBaseUrl;
