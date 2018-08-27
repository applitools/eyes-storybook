// eslint-disable
'use strict';
const puppeteer = require('puppeteer');
const getStories = require('./getStories');
const {initConfig, makeVisualGridClient} = require('@applitools/visual-grid-client');
const {
  extractResources: _extractResources,
  domNodesToCdt: _domNodeToCdt,
} = require('@applitools/visual-grid-client/browser');
const {makeTiming} = require('@applitools/monitoring-commons');
const {performance, timeItAsync} = makeTiming();

// const storybookUrl = 'http://localhost:9001';
const storybookUrl = 'http://react.carbondesignsystem.com';

const serialize = ({resourceUrls, blobs}) => {
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
};

const extractResources = new Function(
  `return (${_extractResources})(document.documentElement, window).then(${serialize})`,
);

const domNodesToCdt = new Function(`return (${_domNodeToCdt})(document)`);

function getStoryTitle({name, kind}) {
  return `${kind}: ${name}`;
}

function getStoryUrl({name, kind}, baseUrl) {
  return `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
    kind,
  )}&selectedStory=${encodeURIComponent(name)}`;
}

(async function() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const {openEyes, waitForTestResults} = makeVisualGridClient({...initConfig(), showLogs: true});

  try {
    await page.goto(storybookUrl);
    let stories = await page.evaluate(getStories);
    // stories = stories.slice(0, 10);
    console.log(`starting to run ${stories.length} stories`);

    const results = await timeItAsync('renderStories', async () => renderStories(stories));
    console.log(
      results.map(
        ([result], i) =>
          `[${result.getStatus()}] [${performance[getStoryTitle(stories[i])]}] ${result.getName()}`,
      ),
    );
  } catch (ex) {
    console.log(ex);
  } finally {
    console.log('total time: ', performance['renderStories']);
    await browser.close();
  }

  async function renderStories(stories) {
    const storiesData = [];
    for (const story of stories) {
      storiesData.push(await getStoryData(story));
    }
    return renderStory(storiesData[0]).then(() =>
      Promise.all(storiesData.slice(1).map(renderStory)),
    );
  }

  async function getStoryData(story) {
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
        batchName: 'simple storybook',
        appName: 'storybook',
        testName: name,
        // showLogs: true,
        // saveDebugData: true,
        // browser: [{width: 1024, height: 768}, {width: 1200, height: 800}],
        browser: {width: 800, height: 600},
      });
      checkWindow({cdt, resourceUrls, resourceContents, url});
      return close(false);
    }).then(results => {
      console.log('finished story', name, 'in', performance[name]);
      return results;
    });
  }
})();
