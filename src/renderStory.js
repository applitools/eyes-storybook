'use strict';
const getStoryTitle = require('./getStoryTitle');

function makeRenderStory({logger, openEyes, performance, timeItAsync}) {
  return function renderStory({name, kind, resourceUrls, resourceContents, frames, cdt, url}) {
    const title = getStoryTitle({name, kind});
    logger.log('running story', title);
    return timeItAsync(title, async () => {
      const {checkWindow, close} = await openEyes({
        testName: title,
        properties: [{name: 'Component name', value: kind}, {name: 'State', value: name}],
      });
      checkWindow({cdt, resourceUrls, resourceContents, url, frames});
      return close(false).catch(err => err);
    }).then(onDoneStory);

    function onDoneStory(resultsOrErr) {
      logger.log('finished story', title, 'in', performance[title]);
      return resultsOrErr;
    }
  };
}

module.exports = makeRenderStory;
