'use strict';
const {presult} = require('@applitools/functional-commons');

function makeGetStoryData({logger, extractResources, domNodesToCdt}) {
  return async function getStoryData(name, url, page) {
    logger.log(`getting data from story ${name} - ${url}`);
    const [err] = await presult(page.goto(url, {timeout: 10000}));
    if (err) {
      logger.log(`error navigating to story ${name}`, err);
    }
    const {resourceUrls, blobs: resourceContents} = await page.evaluate(extractResources);
    const cdt = await page.evaluate(domNodesToCdt);
    logger.log(`done getting data from story ${name}`);
    return {name, resourceUrls, resourceContents, cdt, url};
  };
}

module.exports = makeGetStoryData;
