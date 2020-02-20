'use strict';

function memoryLog(usage) {
  return `Memory usage: ${Object.keys(usage)
    .map(key => `${key}: ${toMB(usage[key])} MB`)
    .join(', ')}`;
}

function toMB(size) {
  return Math.round((size / 1024 / 1024) * 100) / 100;
}

module.exports = memoryLog;
