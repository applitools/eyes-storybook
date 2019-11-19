const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const testStorybook = require('../util/testStorybook');
const path = require('path');
const testServer = require('../util/testServer');
const fakeEyesServer = require('../util/fakeEyesServer');
const eyesStorybook = require('../../src/eyesStorybook');
const generateConfig = require('../../src/generateConfig');
const {configParams: externalConfigParams} = require('@applitools/visual-grid-client');
const {makeTiming} = require('@applitools/monitoring-commons');
const logger = require('../util/testLogger');
const testStream = require('../util/testStream');
const {performance, timeItAsync} = makeTiming();

describe('eyesStorybook', () => {
  let closeStorybook;
  before(async () => {
    closeStorybook = await testStorybook({port: 9001});
  });
  after(async () => {
    await closeStorybook();
  });

  let closeTestServer;
  before(async () => {
    closeTestServer = (await testServer({port: 7272})).close;
  });
  after(async () => {
    await closeTestServer();
  });

  let serverUrl, closeEyesServer;
  before(async () => {
    const {port, close} = await fakeEyesServer();
    closeEyesServer = close;
    serverUrl = `http://localhost:${port}`;
  });
  after(async () => {
    await closeEyesServer();
  });

  it('renders test storybook with fake eyes and visual grid', async () => {
    const {stream, getEvents} = testStream();
    const configPath = path.resolve(__dirname, '../fixtures/applitools.config.js');
    const defaultConfig = {waitBeforeScreenshots: 50};
    const config = generateConfig({argv: {conf: configPath}, defaultConfig, externalConfigParams});
    const results = await eyesStorybook({
      config: {
        serverUrl,
        storybookUrl: 'http://localhost:9001',
        ...config,
        // puppeteerOptions: {headless: false, devtools: true},
        // include: (() => {
        //   let counter = 0;
        //   return () => counter++ < 1;
        // })(),
      },
      logger,
      performance,
      timeItAsync,
      outputStream: stream,
    });

    expect(
      results
        .map(r => ({name: r.getName(), isPassed: r.isPassed()}))
        .sort((a, b) => (a.name < b.name ? -1 : 1)),
    ).to.eql([
      {
        name: 'Button with-space yes-indeed/nested with-space yes/nested again-yes a: c yes-a b',
        isPassed: true,
      },
      {name: 'Button with-space yes-indeed/nested with-space yes: b yes-a b', isPassed: true},
      {name: 'Button with-space yes-indeed: a yes-a b', isPassed: true},
      {name: 'Button: with some emoji', isPassed: true},
      {name: 'Button: with text', isPassed: true},
      {name: 'Image: image', isPassed: true},
      {name: 'Interaction: Popover', isPassed: true},
      {name: 'Nested/Component: story 1.1', isPassed: true},
      {name: 'Nested/Component: story 1.2', isPassed: true},
      {name: 'Nested: story 1', isPassed: true},
      {name: 'RTL: local RTL config', isPassed: true},
      {name: 'RTL: local RTL config [rtl]', isPassed: true},
      {name: 'RTL: should also do RTL', isPassed: true},
      {name: 'RTL: should also do RTL [rtl]', isPassed: true},
      {name: 'SOME section|Nested/Component: story 1.1', isPassed: true},
      {name: 'SOME section|Nested/Component: story 1.2', isPassed: true},
      {name: 'Text: appears after a delay', isPassed: true},
      {
        name: 'Wow|one with-space yes-indeed/nested with-space yes/nested again-yes a: c yes-a b',
        isPassed: true,
      },
    ]);

    expect(getEvents().join('')).to.equal(`- Reading stories
✔ Reading stories
- Done 0 stories out of 18
✔ Done 18 stories out of 18
`);
  });
});
