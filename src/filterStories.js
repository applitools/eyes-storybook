'use strict';

function filterStories({stories, config}) {
  let filteredStories = stories.filter(
    ({parameters}) => !parameters || !parameters.eyes || !parameters.eyes.skip,
  );

  if (config.filterStories !== undefined) {
    filteredStories = filteredStories.filter(
      story =>
        filterStory(story) ||
        (story.parameters && story.parameters.eyes && story.parameters.eyes.skip === false),
    );
  }

  function filterStory(story) {
    if (typeof config.filterStories === 'function') {
      return config.filterStories(story);
    } else {
      try {
        const re = new RegExp(config.filterStories);
        return re.test(story.name);
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

  return filteredStories;
}

module.exports = filterStories;
