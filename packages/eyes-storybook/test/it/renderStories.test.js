'use strict';

const {describe, it} = require('mocha');
const {expect} = require('chai');
const makeRenderStories = require('../../src/renderStories');
const getStoryTitle = require('../../src/getStoryTitle');
const testStream = require('../util/testStream');
const createPagePool = require('../../src/pagePool');
const {delay} = require('@applitools/functional-commons');
const logger = require('../util/testLogger');
const puppeteer = require('puppeteer');

const waitForQueuedRenders = () => {};

describe('renderStories', () => {
  it('returns empty array for 0 stories', async () => {
    const pagePool = createPagePool({
      logger,
      initPage: async index => ({evaluate: async () => index + 1}),
    });
    const {stream, getEvents} = testStream();
    const renderStories = makeRenderStories({
      stream,
      waitForQueuedRenders,
      pagePool,
      logger,
    });

    const results = await renderStories([]);

    expect(results).to.eql([]);
    expect(getEvents()).to.eql(['- Done 0 stories out of 0\n', '✔ Done 0 stories out of 0\n']);
  });

  it('returns results from renderStory', async () => {
    const pagePool = createPagePool({
      logger,
      initPage: async index => ({evaluate: async () => index + 1}),
    });
    pagePool.addToPool((await pagePool.createPage()).pageId);
    pagePool.addToPool((await pagePool.createPage()).pageId);
    pagePool.addToPool((await pagePool.createPage()).pageId);
    await Promise.resolve();
    const getStoryData = async ({story, storyUrl, page}) => {
      await delay(10);
      return {
        cdt: `cdt_${story.name}_${story.kind}_${storyUrl}_${await page.evaluate()}`,
        resourceUrls: `resourceUrls_${story.name}_${story.kind}_${storyUrl}_${await page.evaluate()}`, // eslint-disable-line prettier/prettier
        resourceContents: `resourceContents_${story.name}_${story.kind}_${storyUrl}_${await page.evaluate()}`, // eslint-disable-line prettier/prettier
        frames: `frames_${story.name}_${story.kind}_${storyUrl}_${await page.evaluate()}`,
      };
    };

    const renderStory = async arg => [{arg, getStatus: () => 'Passed'}];

    const storybookUrl = 'http://something';
    const {stream, getEvents} = testStream();

    const renderStories = makeRenderStories({
      getStoryData,
      waitForQueuedRenders,
      renderStory,
      storybookUrl,
      logger,
      stream,
      pagePool,
    });

    const stories = [
      {name: 's1', kind: 'k1'},
      {name: 's2', kind: 'k2'},
      {name: 's3', kind: 'k3'},
      {name: 's4', kind: 'k4'},
      {name: 's5', kind: 'k5'},
      {name: 's6', kind: 'k6'},
      {name: 's7', kind: 'k7'},
    ];

    const results = await renderStories(stories);

    const expectedResults = await Promise.all(
      stories.map(async (story, i) => {
        const storyUrl = `http://something/iframe.html?eyes-storybook=true&selectedKind=${story.kind}&selectedStory=${story.name}`;
        const page = i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3;
        return {
          cdt: `cdt_${story.name}_${story.kind}_${storyUrl}_${page}`,
          resourceUrls: `resourceUrls_${story.name}_${story.kind}_${storyUrl}_${page}`,
          resourceContents: `resourceContents_${story.name}_${story.kind}_${storyUrl}_${page}`, // eslint-disable-line prettier/prettier
          frames: `frames_${story.name}_${story.kind}_${storyUrl}_${page}`,
          story,
          url: storyUrl,
        };
      }),
    );

    expect(results.map(result => result[0].arg).sort((a, b) => a.cdt.localeCompare(b.cdt))).to.eql(
      expectedResults,
    );

    expect(getEvents()).to.eql(['- Done 0 stories out of 7\n', '✔ Done 7 stories out of 7\n']);
  });

  it('passes waitBeforeScreenshot to getStoryData', async () => {
    const pagePool = createPagePool({
      logger,
      initPage: async index => ({evaluate: async () => index + 1}),
    });
    pagePool.addToPool((await pagePool.createPage()).pageId);

    let _waitBeforeScreenshot;
    const getStoryData = async ({waitBeforeStory}) => {
      _waitBeforeScreenshot = waitBeforeStory;
      return {};
    };

    const renderStory = async arg => [{arg, getStatus: () => 'Passed'}];

    const storybookUrl = 'http://something';
    const {stream} = testStream();

    const renderStories = makeRenderStories({
      getStoryData,
      waitForQueuedRenders,
      renderStory,
      storybookUrl,
      logger,
      stream,
      pagePool,
    });

    const results = await renderStories([
      {name: 's1', kind: 'k1', parameters: {eyes: {waitBeforeScreenshot: 'wait_some_value'}}},
    ]);

    expect(_waitBeforeScreenshot).to.eql('wait_some_value');
    expect(JSON.stringify(results[0][0].arg.story)).to.eql(
      JSON.stringify({
        name: 's1',
        kind: 'k1',
        parameters: {eyes: {waitBeforeScreenshot: 'wait_some_value'}},
      }),
    );
  });

  it('returns errors from getStoryData', async () => {
    const pagePool = createPagePool({
      logger,
      initPage: async index => ({evaluate: async () => index + 1}),
    });
    pagePool.addToPool((await pagePool.createPage()).pageId);
    const getStoryData = async () => {
      throw new Error('bla');
    };

    const renderStory = async () => {};

    const storybookUrl = 'http://something';
    const {stream, getEvents} = testStream();

    const renderStories = makeRenderStories({
      getStoryData,
      waitForQueuedRenders,
      pagePool,
      renderStory,
      storybookUrl,
      logger,
      stream,
    });

    const story = {name: 's1', kind: 'k1'};
    const results = await renderStories([story]);

    expect(results[0]).to.be.an.instanceOf(Error);
    expect(results[0].message).to.equal(
      `[page 0] Failed to get story data for "${getStoryTitle(story)}". Error: bla`,
    );

    expect(getEvents()).to.eql(['- Done 0 stories out of 1\n', '✖ Done 1 stories out of 1\n']);
  });

  it('returns errors from renderStory', async () => {
    const pagePool = createPagePool({
      logger,
      initPage: async index => ({evaluate: async () => index + 1}),
    });
    pagePool.addToPool((await pagePool.createPage()).pageId);
    const getStoryData = async () => ({});

    const renderStory = async () => {
      throw new Error('bla');
    };

    const storybookUrl = 'http://something';
    const {stream, getEvents} = testStream();

    const renderStories = makeRenderStories({
      getStoryData,
      waitForQueuedRenders,
      pagePool,
      renderStory,
      storybookUrl,
      logger,
      stream,
    });

    const story = {name: 's1', kind: 'k1'};
    const results = await renderStories([story]);

    expect(results[0]).to.be.an.instanceOf(Error);
    expect(results[0].message).to.equal('bla');

    expect(getEvents()).to.eql(['- Done 0 stories out of 1\n', '✖ Done 1 stories out of 1\n']);
  });

  describe('with puppeteer', () => {
    it("doesn't fail when page is closed", async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      try {
        const pagePool = createPagePool({
          logger,
          initPage: async index => (index === 0 ? page : browser.newPage()),
        });
        pagePool.addToPool((await pagePool.createPage()).pageId);
        await page.close();

        await delay(0);

        const getStoryData = async ({story, storyUrl, page}) => {
          await delay(10);
          const location = await page.evaluate(() => window.location.href); // eslint-disable-line no-undef
          return {
            cdt: `cdt_${story.name}_${story.kind}_${storyUrl}_${location}`,
            resourceUrls: `resourceUrls`,
            resourceContents: `resourceContents`,
            frames: `frames`,
          };
        };

        const renderStory = async arg => [{arg, getStatus: () => 'Passed'}];

        const storybookUrl = 'http://something';
        const {stream, getEvents} = testStream();

        const renderStories = makeRenderStories({
          getStoryData,
          waitForQueuedRenders,
          pagePool,
          renderStory,
          storybookUrl,
          logger,
          stream,
          getClientAPI: () => {},
        });

        const story = {name: 's1', kind: 'k1'};
        const results = await renderStories([story]);

        const storyUrl = `http://something/iframe.html?eyes-storybook=true&selectedKind=${story.kind}&selectedStory=${story.name}`;

        expect(results.map(result => result[0].arg)).to.eql([
          {
            story,
            url: storyUrl,
            cdt:
              'cdt_s1_k1_http://something/iframe.html?eyes-storybook=true&selectedKind=k1&selectedStory=s1_about:blank',
            resourceUrls: 'resourceUrls',
            resourceContents: 'resourceContents',
            frames: 'frames',
          },
        ]);

        expect(getEvents()).to.eql(['- Done 0 stories out of 1\n', '✔ Done 1 stories out of 1\n']);
      } finally {
        await browser.close();
      }
    });

    it("doesn't fail when page is corrupted", async () => {
      const browser = await puppeteer.launch();
      try {
        const pagePool = createPagePool({
          logger,
          initPage: async index => {
            const page = await browser.newPage();
            if (index === 1) {
              await page.evaluate(() => (window.__failTest = true)); // eslint-disable-line no-undef
            }
            return page;
          },
        });
        pagePool.addToPool((await pagePool.createPage()).pageId);

        const getClientAPI = () => {
          // eslint-disable-next-line no-undef
          if (window.__failTest) {
            throw new Error('getClientAPI mock error');
          }
        };

        await delay(0);

        const getStoryData = async ({story, storyUrl, page}) => {
          const shouldFail = await page.evaluate(() => window.__failTest); // eslint-disable-line no-undef
          if (shouldFail) {
            throw new Error('getStoryData mock error');
          } else {
            await delay(100);
            const location = await page.evaluate(() => window.location.href); // eslint-disable-line no-undef
            return {
              cdt: `cdt_${story.name}_${story.kind}_${storyUrl}_${location}`,
              resourceUrls: `resourceUrls`,
              resourceContents: `resourceContents`,
              frames: `frames`,
            };
          }
        };

        const renderStory = async arg => [{arg, getStatus: () => 'Passed'}];

        const storybookUrl = 'http://something';
        const {stream, getEvents} = testStream();

        const renderStories = makeRenderStories({
          getStoryData,
          waitForQueuedRenders,
          pagePool,
          renderStory,
          storybookUrl,
          logger,
          stream,
          getClientAPI,
          maxPageTTL: 10,
        });

        const story = {name: 's1', kind: 'k1'};
        const results = await renderStories([story, story]);

        const storyUrl = `http://something/iframe.html?eyes-storybook=true&selectedKind=${story.kind}&selectedStory=${story.name}`;
        const expectedStory = {
          story,
          url: storyUrl,
          cdt:
            'cdt_s1_k1_http://something/iframe.html?eyes-storybook=true&selectedKind=k1&selectedStory=s1_about:blank',
          resourceUrls: 'resourceUrls',
          resourceContents: 'resourceContents',
          frames: 'frames',
        };

        expect(results[0][0]).not.to.be.an.instanceOf(Error);
        expect(results[0][0].arg).to.eql(expectedStory);
        expect(results[1]).not.to.be.an.instanceOf(Error);
        expect(results[1][0].arg).to.eql(expectedStory);

        expect(getEvents()).to.eql(['- Done 0 stories out of 2\n', '✔ Done 2 stories out of 2\n']);
      } finally {
        await browser.close();
      }
    });
  });

  // TODO execute in separate process
  it.skip("doesn't have memory issues", async () => {
    const pagePool = createPagePool({
      logger,
      initPage: async index => index + 1,
    });
    pagePool.addToPool((await pagePool.createPage()).pageId);
    const length = 1000;
    const stories = new Array(length);
    for (let i = 0; i < length; i++) {
      stories[i] = {name: `s${i}`, kind: `k${i}`};
    }

    const heavySnapshot = allocObjectBuffer(1024 * 1024 * 1); // 1 MB
    const getStoryData = async () => JSON.parse(heavySnapshot);

    const renderStory = async ({cdt}) => {
      await new Promise(r => setTimeout(r, 0));
      return [
        {
          arg: JSON.stringify(cdt).length,
          getStatus: () => 'Passed',
        },
      ];
    };

    const storybookUrl = 'http://something';
    const {stream, getEvents} = testStream();

    const renderStories = makeRenderStories({
      getStoryData,
      waitForQueuedRenders,
      pagePool,
      renderStory,
      storybookUrl,
      logger,
      stream,
    });

    const results = await renderStories(stories);
    const usage = process.memoryUsage();

    expect(results.map(result => result[0].arg)).to.eql(
      new Array(length).fill(JSON.stringify(JSON.parse(heavySnapshot).cdt).length),
    );

    expect(getEvents()).to.eql([
      `- Done 0 stories out of ${length}\n`,
      `✔ Done ${length} stories out of ${length}\n`,
    ]);

    expect(usage.heapUsed).to.be.lessThan(1024 * 1024 * 80); // 80 MB
  });
});

// allocates a buffer containing '{"cdt":[{"x":"qqqqqqqqqqqqqqq"}]}'
function allocObjectBuffer(size) {
  const buff = Buffer.alloc(size);
  buff.fill(String(Math.random()).slice(2));
  buff.write('{"cdt":[{"x":"');
  buff.write('"}]}', size - 4);
  return buff;
}
