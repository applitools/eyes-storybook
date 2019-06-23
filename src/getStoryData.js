'use strict';
const {presult} = require('@applitools/functional-commons');
const {ArgumentGuard} = require('@applitools/eyes-common');
const renderStoryWithClientAPI = require('./renderStoryWithClientAPI');

function makeGetStoryData({logger, processPageAndSerialize, waitBeforeScreenshots}) {
  if (typeof waitBeforeScreenshots === 'number') {
    ArgumentGuard.greaterThanOrEqualToZero(waitBeforeScreenshots, 'waitBeforeScreenshots', true);
  }

  return async function getStoryData({story, storyUrl, page}) {
    logger.log(`getting data from story ${story.kind}: ${story.name} (index=${story.index})`);

    if (story.isApi) {
      const actualVariationParam = await getEyesVariationParam(page);
      const expectedVariationUrlParam =
        story.parameters && story.parameters.eyes
          ? story.parameters.eyes.variationUrlParam
          : undefined;
      if (
        (!actualVariationParam && !expectedVariationUrlParam) ||
        actualVariationParam === expectedVariationUrlParam
      ) {
        await page.evaluate(renderStoryWithClientAPI, story.index);
      } else {
        await renderStoryLegacy();
      }
    } else {
      await renderStoryLegacy();
    }
    if (waitBeforeScreenshots !== undefined) {
      await page.waitFor(waitBeforeScreenshots);
    }

    const {resourceUrls, blobs, frames, cdt} = await page.evaluate(processPageAndSerialize);
    const resourceContents = blobs.map(({url, type, value}) => ({
      url,
      type,
      value: Buffer.from(value, 'base64'),
    }));
    logger.log(`done getting data from story ${storyUrl}`);
    return {resourceUrls, resourceContents, cdt, frames};

    async function renderStoryLegacy() {
      logger.log(`getting data from story ${storyUrl}`);
      const [err] = await presult(page.goto(storyUrl, {timeout: 10000}));
      if (err) {
        logger.log(`error navigating to story ${storyUrl}`, err);
        throw err;
      }
    }

    async function getEyesVariationParam() {
      try {
        return new URL(await page.url()).searchParams.get('eyes-variation');
      } catch (ex) {
        logger.log('failed to get url from page (in need of eyes-variation param)');
      }
    }
  };
}

module.exports = makeGetStoryData;
