'use strict';
const puppeteer = require('puppeteer');
const getStories = require('../dist/getStories');
const {makeVisualGridClient} = require('@applitools/visual-grid-client');
const {getProcessPageAndSerialize} = require('@applitools/dom-snapshot');
const {presult} = require('@applitools/functional-commons');
const makeRenderStory = require('./renderStory');
const makeRenderStories = require('./renderStories');
const makeGetStoryData = require('./getStoryData');
const ora = require('ora');
const flatten = require('lodash.flatten');
const filterStories = require('./filterStories');
const addVariationStories = require('./addVariationStories');
const browserLog = require('./browserLog');
const memoryLog = require('./memoryLog');
const getIframeUrl = require('./getIframeUrl');

const CONCURRENT_PAGES = 3;

async function eyesStorybook({
  config,
  logger,
  performance,
  timeItAsync,
  outputStream = process.stderr,
}) {
  let memoryTimeout;
  takeMemLoop();
  logger.log('eyesStorybook started');
  const {storybookUrl, waitBeforeScreenshots, readStoriesTimeout} = config;
  const browser = await puppeteer.launch(config.puppeteerOptions);
  logger.log('browser launched');
  const page = await browser.newPage();
  const userAgent = await page.evaluate('navigator.userAgent');
  const {openEyes} = makeVisualGridClient({userAgent, ...config, logger: logger.extend('vgc')});

  const processPageAndSerialize = `(${await getProcessPageAndSerialize()})(document, {useSessionCache: true, showLogs: ${
    config.showLogs
  }})`;
  logger.log('got script for processPage');
  browserLog({
    page,
    onLog: text => {
      logger.log(`master tab: ${text}`);
    },
  });

  try {
    let stories = await getStoriesWithSpinner();

    if (process.env.APPLITOOLS_STORYBOOK_DEBUG) {
      stories = stories.slice(0, 5);
    }

    const filteredStories = filterStories({stories, config});

    const storiesIncludingVariations = addVariationStories({stories: filteredStories, config});

    logger.log(`starting to run ${storiesIncludingVariations.length} stories`);

    const pages = await initPagesForBrowser(browser);

    logger.log(`${pages.length} pages open`);

    const getStoryData = makeGetStoryData({logger, processPageAndSerialize, waitBeforeScreenshots});
    const renderStory = makeRenderStory({
      logger: logger.extend('renderStory'),
      openEyes,
      performance,
      timeItAsync,
    });
    const renderStories = makeRenderStories({
      getStoryData,
      pages,
      renderStory,
      storybookUrl,
      logger,
      stream: outputStream,
    });

    logger.log('finished creating functions');

    const [error, results] = await presult(
      timeItAsync('renderStories', () => renderStories(storiesIncludingVariations)),
    );

    if (error) {
      const msg = refineErrorMessage({prefix: 'Error in renderStories:', error});
      logger.log(error);
      throw new Error(msg);
    } else {
      return flatten(results);
    }
  } finally {
    logger.log('total time: ', performance['renderStories']);
    logger.log('perf results', performance);
    await browser.close();
    clearTimeout(memoryTimeout);
  }

  async function initPagesForBrowser(browser) {
    let iframeUrl;
    try {
      iframeUrl = getIframeUrl(storybookUrl);
    } catch (ex) {
      logger.log(ex);
      throw new Error(`Storybook URL is not valid: ${storybookUrl}`);
    }

    return Promise.all(
      new Array(CONCURRENT_PAGES).fill().map(async (_x, i) => {
        const page = await browser.newPage();
        if (config.showLogs) {
          browserLog({
            page,
            onLog: text => {
              if (text.match(/\[dom-snapshot\]/)) {
                logger.log(`tab ${i}: ${text}`);
              }
            },
          });
        }
        const [err] = await presult(page.goto(iframeUrl, {timeout: readStoriesTimeout}));
        if (err) {
          logger.log(`error navigating to iframe.html`, err);
          throw err;
        }
        return page;
      }),
    );
  }

  function takeMemLoop() {
    logger.log(memoryLog(process.memoryUsage()));
    memoryTimeout = setTimeout(takeMemLoop, 30000);
  }

  async function getStoriesWithSpinner() {
    logger.log('Getting stories from storybook');
    const spinner = ora({text: 'Reading stories', stream: outputStream});
    spinner.start();
    logger.log('navigating to storybook url:', storybookUrl);
    const [navigateErr] = await presult(page.goto(storybookUrl, {timeout: readStoriesTimeout}));
    if (navigateErr) {
      logger.log('Error when loading storybook', navigateErr);
      const failMsg = refineErrorMessage({
        prefix: 'Error when loading storybook.',
        error: navigateErr,
      });
      spinner.fail(failMsg);
      throw new Error();
    }
    const [getStoriesErr, stories] = await presult(
      page.evaluate(getStories, {timeout: readStoriesTimeout}),
    );
    if (getStoriesErr) {
      logger.log('Error in getStories:', getStoriesErr);
      const failMsg = refineErrorMessage({
        prefix: 'Error when reading stories:',
        error: getStoriesErr,
      });
      spinner.fail(failMsg);
      throw new Error();
    }
    spinner.succeed();
    logger.log(`got ${stories.length} stories:`, JSON.stringify(stories));
    return stories;
  }

  function refineErrorMessage({prefix, error}) {
    return `${prefix} ${error.message.replace('Evaluation failed: ', '')}`;
  }
}

module.exports = eyesStorybook;
