const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const testStorybook = require('../util/testStorybook');
const eyesStorybook = require('../../src/eyesStorybook');
const generateConfig = require('../../src/generateConfig');
const {configParams: externalConfigParams} = require('@applitools/visual-grid-client');
const {Logger} = require('@applitools/eyes-common');
const path = require('path');
const {makeTiming} = require('@applitools/monitoring-commons');
const {performance, timeItAsync} = makeTiming();

describe('eyes-storybook', () => {
  let closeStorybook;
  before(async () => {
    closeStorybook = await testStorybook({port: 9001});
  });

  after(async () => {
    closeStorybook();
  });

  it('renders test storybook', async () => {
    const configPath = path.resolve(__dirname, '../fixtures/applitools.config.js');
    const defaultConfig = {waitBeforeScreenshots: 50};
    const config = generateConfig({argv: {conf: configPath}, defaultConfig, externalConfigParams});
    const results = await eyesStorybook({
      config: {storybookUrl: 'http://localhost:9001', ...config},
      logger: new Logger(config.showLogs),
      performance,
      timeItAsync,
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
      {name: 'Nested/Component: story 1.1', isPassed: true},
      {name: 'Nested/Component: story 1.2', isPassed: true},
      {name: 'Nested: story 1', isPassed: true},
    ]);
  });
});
