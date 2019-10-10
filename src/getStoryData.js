'use strict';
const {presult} = require('@applitools/functional-commons');
const {ArgumentGuard} = require('@applitools/eyes-common');

function makeGetStoryData({logger, processPageAndSerialize, waitBeforeScreenshot}) {
  return async function getStoryData({url, page, waitBeforeStory}) {
    logger.log(`getting data from story ${url}`);
    const [err] = await presult(page.goto(url, {timeout: 10000}));
    if (err) {
      logger.log(`error navigating to story ${url}`, err);
    }

    const wait = waitBeforeStory || waitBeforeScreenshot;
    if (typeof wait === 'number') {
      ArgumentGuard.greaterThanOrEqualToZero(wait, 'waitBeforeScreenshot', true);
    }
    if (wait) {
      logger.log(`waiting before screenshot: ${wait}`);
      await page.waitFor(wait);
    }

    const {resourceUrls, blobs, frames, cdt} = await page.evaluate(processPageAndSerialize);
    const resourceContents = blobs.map(({url, type, value}) => ({
      url,
      type,
      value: Buffer.from(value, 'base64'),
    }));
    logger.log(`done getting data from story ${url}`);
    return {resourceUrls, resourceContents, cdt, frames};
  };
}

module.exports = makeGetStoryData;
