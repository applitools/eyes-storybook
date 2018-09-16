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

  try {
    page.on('console', msg => {
      logger.log(msg.args().join(' '));
    });

    const gettingStoriesSpinner = ora('Reading stories');
    gettingStoriesSpinner.start();
    await page.goto(storybookUrl);
    let stories = await page.evaluate(getStories);
    // stories = stories.slice(0, 5);
    gettingStoriesSpinner.stopAndPersist({symbol: 'v'});

    logger.log(`starting to run ${stories.length} stories`);

    const [error, results] = await presult(
      timeItAsync('renderStories', async () => renderStories(stories)),
    );

    if (error) {
      console.log('error', error);
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

  async function renderStories(stories) {
    let runningStories = 0;
    let doneStories = 0;
    const spinner = ora(`Done 0 stories out of ${stories.length}`);
    spinner.start();
    const storyPromises = [];
    const chunks = getChunks(stories, pages.length);
    await Promise.all(
      chunks.map(async (chunk, i) => {
        for (const story of chunk) {
          const storyDataPromise = getStoryData(story, pages[i]); // TODO handle error
          const storyRenderPromise = storyDataPromise
            .then(updateRunning)
            .then(renderStory)
            .then(onDoneStory, onDoneStory);
          storyPromises.push(storyRenderPromise);
          await storyDataPromise;
        }
      }),
    );

    const renderStoriesPromise = Promise.all(storyPromises);
    renderStoriesPromise.then(stopSpinnerSuccess, stopSpinnerFail);
    return renderStoriesPromise;

    function updateRunning(data) {
      ++runningStories;
      spinner.text = `Done ${doneStories} stories out of ${stories.length}${currentlyRunning()}`;
      return data;
    }

    function stopSpinnerSuccess() {
      spinner.stopAndPersist({symbol: 'v'});
    }

    function stopSpinnerFail() {
      spinner.stopAndPersist({symbol: 'x'});
    }

    function onDoneStory(resultsOrErr) {
      --runningStories;
      spinner.text = `Done ${++doneStories} stories out of ${stories.length}${currentlyRunning()}`;
      return resultsOrErr;
    }

    function currentlyRunning() {
      return runningStories ? ` (currently running ${runningStories} stories)` : '';
    }
  }

  async function getStoryData(story, page) {
    const name = getStoryTitle(story);
    const url = getStoryUrl(story, storybookUrl);
    logger.log(`getting data from story ${name} - ${url}`);
    await page.goto(url);
    const {resourceUrls, blobs: resourceContents} = await page.evaluate(extractResources);
    const cdt = await page.evaluate(domNodesToCdt);
    return {name, resourceUrls, resourceContents, cdt, url};
  }

  function renderStory({name, resourceUrls, resourceContents, cdt, url}) {
    logger.log('running story', name);
    return timeItAsync(name, async () => {
      const {checkWindow, close} = await openEyes({
        testName: name,
      });
      checkWindow({cdt, resourceUrls, resourceContents, url});
      return close(false).catch(err => err);
    }).then(onDoneStory, onDoneStory);

    function onDoneStory(resultsOrErr) {
      logger.log('finished story', name, 'in', performance[name]);
      return resultsOrErr;
    }
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

function getStoryTitle({name, kind}) {
  return `${kind}: ${name}`;
}

function getStoryUrl({name, kind}, baseUrl) {
  return `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
    kind,
  )}&selectedStory=${encodeURIComponent(name)}`;
}

module.exports = eyesStorybook;
