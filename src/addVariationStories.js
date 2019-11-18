'use strict';

function addVariationStories({stories, config}) {
  const globalVariationFunc =
    typeof config.variations === 'function' ? config.variations : undefined;
  const globalVariationArray = Array.isArray(config.variations) ? config.variations : undefined;
  const storiesToAddVariations = stories.filter(getStoryVariations);

  const storiesByVariation = {};

  for (const story of storiesToAddVariations) {
    const variations = getStoryVariations(story);
    if (!Array.isArray(variations)) {
      throw new Error('variations should be an array');
    }

    for (const variation of variations) {
      const variationArr = storiesByVariation[variation] || (storiesByVariation[variation] = []);
      variationArr.push({
        ...story,
        parameters: addFlagToParameters(story.parameters, variation),
      });
    }
  }

  return Object.keys(storiesByVariation).reduce((storiesWithVariations, variation) => {
    return storiesWithVariations.concat(storiesByVariation[variation]);
  }, stories);

  function getStoryVariations(story) {
    if (story.parameters && story.parameters.eyes && story.parameters.eyes.variations) {
      return story.parameters.eyes.variations;
    }

    if (globalVariationFunc) {
      return globalVariationFunc(story);
    }

    if (globalVariationArray) return globalVariationArray;
  }
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
