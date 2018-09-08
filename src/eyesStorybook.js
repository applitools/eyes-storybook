'use strict';
const puppeteer = require('puppeteer');
const getStories = require('./getStories');
const {makeVisualGridClient} = require('@applitools/visual-grid-client');
const {
  extractResources: _extractResources,
  domNodesToCdt: _domNodeToCdt,
} = require('@applitools/visual-grid-client/browser');
const {makeTiming} = require('@applitools/monitoring-commons');
const {performance, timeItAsync} = makeTiming();
const getChunks = require('./getChunks');
const createLogger = require('@applitools/visual-grid-client/src/sdk/createLogger');

const extractResources = new Function(
  `return (${_extractResources})(document.documentElement, window).then(${serialize})`,
);

const domNodesToCdt = new Function(`return (${_domNodeToCdt})(document)`);

const CONCURRENT_PAGES = 3;

async function eyesStorybook(storybookUrl, {getConfig, updateConfig, getInitialConfig}) {
  const browser = await puppeteer.launch();
  const pages = await Promise.all(new Array(CONCURRENT_PAGES).fill().map(() => browser.newPage()));
  const {openEyes, waitForTestResults} = makeVisualGridClient({
    getConfig,
    updateConfig,
    getInitialConfig,
    showLogs: getConfig().showLogs,
  });
  const logger = createLogger(getConfig().showLogs);

  try {
    await pages[0].goto(storybookUrl);
    let stories = await pages[0].evaluate(getStories);
    // stories = stories.slice(0, 10);
    logger.log(`starting to run ${stories.length} stories`);

    const results = await timeItAsync('renderStories', async () => renderStories(stories));
    logger.log(
      results.map(
        ([result], i) =>
          `[${result.getStatus()}] [${performance[getStoryTitle(stories[i])]}] ${result.getName()}`,
      ),
    );
    return results.map(([result]) => result);
  } catch (ex) {
    logger.log(ex);
  } finally {
    logger.log('total time: ', performance['renderStories']);
    await browser.close();
  }

  async function renderStories(stories) {
    const storyPromises = [];
    const chunks = getChunks(stories, pages.length);
    await Promise.all(
      chunks.map(async (chunk, i) => {
        for (const story of chunk) {
          const storyDataPromise = getStoryData(story, pages[i]);
          storyPromises.push(storyDataPromise.then(renderStory));
          await storyDataPromise;
        }
      }),
    );

    return waitForTestResults(storyPromises);
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
      return close(false);
    }).then(results => {
      logger.log('finished story', name, 'in', performance[name]);
      return results;
    });
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
