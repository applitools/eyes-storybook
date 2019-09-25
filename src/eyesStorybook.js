'use strict';
const puppeteer = require('puppeteer');
const getStories = require('./getStories');
const {makeVisualGridClient} = require('@applitools/visual-grid-client');
const {getProcessPageAndSerialize} = require('@applitools/dom-snapshot');
const {presult} = require('@applitools/functional-commons');
const makeRenderStory = require('./renderStory');
const makeRenderStories = require('./renderStories');
const makeGetStoryData = require('./getStoryData');
const getChunks = require('./getChunks');
const ora = require('ora');
const flatten = require('lodash.flatten');
const chalk = require('chalk');
const filterStories = require('./filterStories');
const addVariationStories = require('./addVariationStories');
const getStorybookBaseUrl = require('./getStorybookBaseUrl');

const CONCURRENT_PAGES = 3;

async function eyesStorybook({config, logger, performance, timeItAsync}) {
  logger.log('eyesStorybook started');
  const {storybookUrl, waitBeforeScreenshots} = config;
  const storybookBaseUrl = getStorybookBaseUrl(storybookUrl);
  const browser = await puppeteer.launch(config.puppeteerOptions);
  logger.log('browser launched');
  const pages = await Promise.all(new Array(CONCURRENT_PAGES).fill().map(() => browser.newPage()));
  logger.log(`${CONCURRENT_PAGES} pages open`);
  const page = pages[0];
  const userAgent = await page.evaluate('navigator.userAgent');
  const {openEyes, closeBatch} = makeVisualGridClient({
    userAgent,
    ...config,
    logger: logger.extend('vgc'),
  });

  const processPageAndSerialize = `(${await getProcessPageAndSerialize()})()`;
  logger.log('got script for processPage');
  const getStoryData = makeGetStoryData({logger, processPageAndSerialize, waitBeforeScreenshots});
  const renderStory = makeRenderStory({
    logger: logger.extend('renderStory'),
    openEyes,
    performance,
    timeItAsync,
  });
  const renderStories = makeRenderStories({
    getChunks,
    getStoryData,
    pages,
    renderStory,
    storybookBaseUrl,
    logger,
  });

  logger.log('finished creating functions');
  try {
    let hasConsoleErr;
    page.on('console', msg => {
      hasConsoleErr =
        msg.args()[0] &&
        msg.args()[0]._remoteObject &&
        msg.args()[0]._remoteObject.subtype === 'error';
      logger.log(msg.args().join(' '));
    });

    const spinner = ora('Reading stories');
    spinner.start();
    logger.log('navigating to storybook url:', storybookUrl);
    await page.goto(storybookUrl);

    logger.log('Getting stories from storybook');
    let stories = await page.evaluate(getStories);
    logger.log(`got ${stories.length} stories:`, JSON.stringify(stories));
    if (!stories.length && hasConsoleErr) {
      return [
        new Error(
          'Could not load stories, make sure your storybook renders correctly. perhaps no stories were rendered ?',
        ),
      ];
    }

    const badParamsError = stories
      .map(s => s.error)
      .filter(Boolean)
      .join('\n');
    if (badParamsError) {
      console.log(chalk.red(`\n${badParamsError}`));
    }

    spinner.succeed();
    if (process.env.APPLITOOLS_STORYBOOK_DEBUG) {
      stories = stories.slice(0, 5);
    }

    const filteredStories = filterStories({stories, config});

    const storiesIncludingVariations = addVariationStories({stories: filteredStories, config});

    logger.log(`starting to run ${storiesIncludingVariations.length} stories`);

    const [error, results] = await presult(
      timeItAsync('renderStories', async () => {
        const res = await renderStories(storiesIncludingVariations);
        await closeBatch();
        return res;
      }),
    );

    if (error) {
      console.log(chalk.red(`Error when rendering stories: ${error}`));
      return [];
    } else {
      return flatten(results);
    }
  } catch (ex) {
    logger.log(ex);
    if (ex instanceof SyntaxError) {
      throw ex;
    }
  } finally {
    logger.log('total time: ', performance['renderStories']);
    await browser.close();
  }
}

module.exports = eyesStorybook;
