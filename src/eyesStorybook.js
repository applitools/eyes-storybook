'use strict';
const puppeteer = require('puppeteer');
const getStories = require('./getStories');
const {makeVisualGridClient} = require('@applitools/visual-grid-client');
const {
  extractResources: _extractResources,
  domNodesToCdt: _domNodeToCdt,
} = require('@applitools/visual-grid-client/browser');
const {makeTiming} = require('@applitools/monitoring-commons');
const {presult} = require('@applitools/functional-commons');
const {performance, timeItAsync} = makeTiming();
const makeRenderStory = require('./renderStory');
const makeRenderStories = require('./renderStories');
const makeGetStoryData = require('./getStoryData');
const getChunks = require('./getChunks');
const createLogger = require('@applitools/visual-grid-client/src/sdk/createLogger');
const ora = require('ora');
const flatten = require('lodash.flatten');

const extractResources = new Function(
  `return (${_extractResources})(document.documentElement, window).then(${serialize})`,
);

const domNodesToCdt = new Function(`return (${_domNodeToCdt})(document)`);

const CONCURRENT_PAGES = 3;

async function eyesStorybook(storybookUrl, {getConfig, updateConfig, getInitialConfig}) {
  const browser = await puppeteer.launch();
  const pages = await Promise.all(new Array(CONCURRENT_PAGES).fill().map(() => browser.newPage()));
  const page = pages[0];
  const {openEyes} = makeVisualGridClient({
    getConfig,
    updateConfig,
    getInitialConfig,
    showLogs: getConfig().showLogs,
  });
  const logger = createLogger(getConfig().showLogs);

  const getStoryData = makeGetStoryData({logger, extractResources, domNodesToCdt});
  const renderStory = makeRenderStory({logger, openEyes, performance, timeItAsync});
  const renderStories = makeRenderStories({
    getChunks,
    getStoryData,
    pages,
    renderStory,
    ora,
    storybookUrl,
  });

  try {
    page.on('console', msg => {
      logger.log(msg.args().join(' '));
    });

    const spinner = ora('Reading stories');
    spinner.start();
    await page.goto(storybookUrl);
    let stories = await page.evaluate(getStories);
    spinner.succeed();

    if (process.env.APPLITOOLS_STORYBOOK_DEBUG) {
      stories = stories.slice(0, 5);
    }

    logger.log(`starting to run ${stories.length} stories`);

    const [error, results] = await presult(
      timeItAsync('renderStories', async () => renderStories(stories)),
    );

    if (error) {
      console.log('Error when rendering stories', error);
      return [];
    } else {
      return flatten(results);
    }
  } catch (ex) {
    logger.log(ex);
  } finally {
    logger.log('total time: ', performance['renderStories']);
    await browser.close();
  }
}

function serialize({resourceUrls, blobs}) {
  //eslint-disable-next-line
  const decoder = new TextDecoder('utf-8');
  return {
    resourceUrls,
    blobs: blobs.map(({url, type, value}) => ({
      url,
      type,
      value: decoder.decode(value),
    })),
  };
}

module.exports = eyesStorybook;
