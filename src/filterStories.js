'use strict';

function filterStories({stories, config}) {
  let filteredStories = stories.filter(
    ({parameters}) => !parameters || !parameters.eyes || !parameters.eyes.skip,
  );

  if (config.filterStories !== undefined) {
    const filter = getFilterFromConfig(config);
    filteredStories = filteredStories.filter(
      story =>
        filterStory(filter, story) ||
        (story.parameters && story.parameters.eyes && story.parameters.eyes.skip === false),
    );
  }

  return filteredStories;
}

function filterStory(filter, story) {
  if (typeof filter === 'function') {
    return filter(story);
  } else {
    return filter.test(story.name);
  }
}

function getFilterFromConfig(config) {
  if (typeof config.filterStories === 'function') {
    return config.filterStories;
  } else {
    try {
      return new RegExp(config.filterStories);
    } catch (e) {
      // TODO verify this error early in order to fail fast
      if (e instanceof SyntaxError) {
        const e2 = new SyntaxError(e);
        e2.message = `Eyes storybook configuration has an invalid value for 'filterStories' - it cannot be interpreted as a regular expression. This is probably an issue in 'applitools.config.js' file. Original error is: ${e.message}`;
        throw e2;
      }
    }
  }
}

module.exports = filterStories;
