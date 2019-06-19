'use strict';

function filterStories({stories, config}) {
  return stories.filter(story => filterStory(story, config));
}

function filterStory(story, config) {
  const localInclude =
    story.parameters && story.parameters.eyes && story.parameters.eyes.hasOwnProperty('include')
      ? story.parameters.eyes.include
      : undefined;

  if (localInclude !== undefined) {
    return localInclude;
  } else if (typeof config.include === 'function') {
    return config.include(story);
  } else if (config.include !== undefined) {
    return config.include;
  } else {
    return true;
  }
}

module.exports = filterStories;
