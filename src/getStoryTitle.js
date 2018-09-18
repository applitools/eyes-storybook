'use strict';

function getStoryTitle({name, kind}) {
  return `${kind}: ${name}`;
}

module.exports = getStoryTitle;
