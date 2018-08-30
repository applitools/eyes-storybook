'use strict';

function getChunks(array, chunkCount) {
  const remainder = array.length % chunkCount;
  const chunkSize = Math.floor(array.length / chunkCount);
  return new Array(chunkCount).fill().map((_x, index) => {
    const startIndex = index * chunkSize + Math.min(index, remainder);
    const endIndex = startIndex + chunkSize + (index < remainder ? 1 : 0);
    return array.slice(startIndex, endIndex);
  });
}

module.exports = getChunks;
