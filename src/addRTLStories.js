'use strict';

function addRTLStories({stories, config}) {
  const storiesWithRTL = [...stories];
  const re = getFilterFromConfig(config);

  let storiesToAddRTL = stories.filter(
    ({name, parameters}) =>
      (parameters && parameters.eyes && parameters.eyes.rtl) || (re && re.test(name)),
  );

  for (const story of storiesToAddRTL) {
    storiesWithRTL.push({
      ...story,
      parameters: addFlagToParameters(story.parameters),
    });
  }

  return storiesWithRTL;
}

function getFilterFromConfig(config) {
  if (config.rtlRegex !== undefined) {
    try {
      return new RegExp(config.rtlRegex);
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

function addFlagToParameters(parameters) {
  return parameters
    ? {
        ...parameters,
        eyes: parameters.eyes ? {...parameters.eyes, shouldAddRTL: true} : {shouldAddRTL: true},
      }
    : {eyes: {shouldAddRTL: true}};
}

module.exports = addRTLStories;
