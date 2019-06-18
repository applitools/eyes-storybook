'use strict';

function addVariationStories({stories, config}) {
  const storiesWithVariations = [...stories];

  const globalVariationFunc = typeof config.variations === 'function' && config.variations;
  let storiesToAddVariations = stories.filter(story =>
    getStoryVariations(story, globalVariationFunc),
  );

  for (const story of storiesToAddVariations) {
    const variations = getStoryVariations(story, globalVariationFunc);
    if (!Array.isArray(variations)) {
      throw new Error('variations should be an array');
    }

    for (const variation of variations) {
      storiesWithVariations.push({
        ...story,
        parameters: addFlagToParameters(story.parameters, variation),
      });
    }
  }

  return storiesWithVariations;
}

function getStoryVariations(story, globalVariationFunc) {
  return (
    (story.parameters && story.parameters.eyes && story.parameters.eyes.variations) ||
    (globalVariationFunc && globalVariationFunc(story))
  );
}

function addFlagToParameters(parameters, variation) {
  return parameters
    ? {
        ...parameters,
        eyes: parameters.eyes
          ? {...parameters.eyes, variationUrlParam: variation}
          : {variationUrlParam: variation},
      }
    : {eyes: {variationUrlParam: variation}};
}

module.exports = addVariationStories;
