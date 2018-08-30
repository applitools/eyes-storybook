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
    showLogs: true,
  });

  try {
    await pages[0].goto(storybookUrl);
    let stories = await pages[0].evaluate(getStories);
    // stories = stories.slice(0, 10);
    console.log(`starting to run ${stories.length} stories`);

    const results = await timeItAsync('renderStories', async () => renderStories(stories));
    console.log(
      results.map(
        ([result], i) =>
          `[${result.getStatus()}] [${performance[getStoryTitle(stories[i])]}] ${result.getName()}`,
      ),
    );
    return results.map(([result]) => result);
  } catch (ex) {
    console.log(ex);
  } finally {
    console.log('total time: ', performance['renderStories']);
    await browser.close();
  }

  async function renderStories(stories) {
    const storiesData = await timeItAsync('getStoriesData', () => getStoriesData(stories));
    console.log(`get stories data took ${performance['getStoriesData']}ms`);
    return renderStory(storiesData[0]).then(() =>
      waitForTestResults(storiesData.slice(1).map(renderStory)),
    );
  }

  async function getStoriesData(stories) {
    const storiesData = [];
    const chunks = getChunks(stories, pages.length);
    await Promise.all(
      chunks.map(async (chunk, i) => {
        for (const story of chunk) {
          storiesData.push(await getStoryData(story, pages[i]));
        }
      }),
    );
    return storiesData;
  }

  async function getStoryData(story, page) {
    const name = getStoryTitle(story);
    const url = getStoryUrl(story, storybookUrl);
    console.log(`getting data from story ${name} - ${url}`);
    await page.goto(url);
    const {resourceUrls, blobs: resourceContents} = await page.evaluate(extractResources);
    const cdt = await page.evaluate(domNodesToCdt);
    return {name, resourceUrls, resourceContents, cdt, url};
  }

  function renderStory({name, resourceUrls, resourceContents, cdt, url}) {
    console.log('running story', name);
    return timeItAsync(name, async () => {
      const {checkWindow, close} = await openEyes({
        testName: name,
      });
      checkWindow({cdt, resourceUrls, resourceContents, url});
      return close(false);
    }).then(results => {
      console.log('finished story', name, 'in', performance[name]);
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
