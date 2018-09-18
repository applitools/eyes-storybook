'use strict';

function makeGetStoryData({logger, extractResources, domNodesToCdt}) {
  return async function getStoryData(name, url, page) {
    logger.log(`getting data from story ${name} - ${url}`);
    await page.goto(url);
    const {resourceUrls, blobs: resourceContents} = await page.evaluate(extractResources);
    const cdt = await page.evaluate(domNodesToCdt);
    return {name, resourceUrls, resourceContents, cdt, url};
  };
}

module.exports = makeGetStoryData;
