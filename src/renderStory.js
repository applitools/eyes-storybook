'use strict';
const getStoryTitle = require('./getStoryTitle');

function makeRenderStory({logger, openEyes, performance, timeItAsync}) {
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
      console.warn(
        'WARNING! "sizeMode" is eprecated and will be removed in the future, please use target instead.',
      );
    }

    logger.log('running story', title);
    return timeItAsync(title, async () => {
      const {checkWindow, close} = await openEyes({
        testName: title,
        properties: [
          {name: 'Component name', value: kind},
          {name: 'State', value: name},
        ],
      });
      checkWindow({
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
      });
      return close(false);
    }).then(onDoneStory);

    function onDoneStory(results) {
      logger.log('finished story', title, 'in', performance[title]);
      return results;
    }
  };
}

module.exports = makeRenderStory;
