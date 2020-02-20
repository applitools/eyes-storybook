'use strict';
const getStoryTitle = require('./getStoryTitle');
const deprecationWarning = require('./deprecationWarning');

function makeRenderStory({logger, testWindow, performance, timeItAsync}) {
  return function renderStory({story, resourceUrls, resourceContents, frames, cdt, url}) {
    const {name, kind, parameters} = story;
    const title = getStoryTitle({name, kind, parameters});
    const eyesOptions = (parameters && parameters.eyes) || {};
    const {
      ignore,
      accessibility,
      floating,
      strict,
      layout,
      scriptHooks,
      sizeMode,
      target,
      fully,
      selector,
      region,
      tag,
    } = eyesOptions;

    if (sizeMode) {
      console.log(deprecationWarning("'sizeMode'", "'target'"));
    }

    logger.log('running story', title);

    const openParams = {
      testName: title,
      properties: [
        {name: 'Component name', value: kind},
        {name: 'State', value: name},
      ],
    };

    const checkParams = {
      cdt,
      resourceUrls,
      resourceContents,
      url,
      frames,
      ignore,
      accessibility,
      floating,
      strict,
      layout,
      scriptHooks,
      sizeMode,
      target,
      fully,
      selector,
      region,
      tag,
    };

    return timeItAsync(title, async () => {
      return testWindow({openParams, checkParams, throwEx: false});
    }).then(onDoneStory);

    function onDoneStory(results) {
      logger.log('finished story', title, 'in', performance[title]);
      return results;
    }
  };
}

module.exports = makeRenderStory;
