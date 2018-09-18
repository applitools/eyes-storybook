'use strict';

function makeRenderStory({logger, openEyes, performance, timeItAsync}) {
  return function renderStory({name, resourceUrls, resourceContents, cdt, url}) {
    logger.log('running story', name);
    return timeItAsync(name, async () => {
      const {checkWindow, close} = await openEyes({
        testName: name,
      });
      checkWindow({cdt, resourceUrls, resourceContents, url});
      return close(false).catch(err => err);
    }).then(onDoneStory);

    function onDoneStory(resultsOrErr) {
      logger.log('finished story', name, 'in', performance[name]);
      return resultsOrErr;
    }
  };
}

module.exports = makeRenderStory;
