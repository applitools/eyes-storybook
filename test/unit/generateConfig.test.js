'use strict';
const {describe, it, beforeEach, afterEach} = require('mocha');
const {expect} = require('chai');
const generateConfig = require('../../src/generateConfig');

describe('generateConfig', function() {
  let env;
  beforeEach(() => {
    env = process.env;
    process.env = {};
  });

  afterEach(() => {
    process.env = env;
  });

  it('handles defaultConfig', () => {
    const config = generateConfig({
      defaultConfig: {bla: 1},
    });

    expect(config).to.eql({bla: 1});
  });

  it('handles argv', () => {
    process.env.APPLITOOLS_BLA = 'from env';
    const config = generateConfig({
      defaultConfig: {knownProp: 'from default'},
      argv: {knownProp: 'from argv', unknownProp: 3},
    });

    expect(config).to.eql({knownProp: 'from argv'});
  });

  it('handles env config', () => {
    process.env.APPLITOOLS_BLA = 'from env';
    const config = generateConfig({
      defaultConfig: {bla: 'from default'},
    });
    expect(config).to.eql({bla: 'from env'});
  });

  it('handles externalConfigParams', () => {
    const config = generateConfig({
      externalConfigParams: ['bla'],
    });
    expect(config).to.eql({});

    process.env.APPLITOOLS_BLA = 'bla from env';
    const config2 = generateConfig({
      externalConfigParams: ['bla'],
    });
    expect(config2).to.eql({bla: 'bla from env'});

    const config3 = generateConfig({
      externalConfigParams: ['bla'],
      defaultConfig: {kuku: 'buku'},
    });
    expect(config3).to.eql({bla: 'bla from env', kuku: 'buku'});
  });

  it('handles externalConfigParams with argv', () => {
    process.env.APPLITOOLS_BLA = 'bla from env';
    const config = generateConfig({
      externalConfigParams: ['bla'],
      argv: {bla: 'bla from argv'},
    });
    expect(config).to.eql({bla: 'bla from argv'});
  });

  it('handles number waitBeforeScreenshot from env variable', () => {
    process.env.APPLITOOLS_WAIT_BEFORE_SCREENSHOT = '1234';
    const config = generateConfig({
      externalConfigParams: ['waitBeforeScreenshot'],
    });
    expect(config).to.eql({waitBeforeScreenshot: 1234});
  });

  it('backward compatible for waitBeforeScreenshots', () => {
    process.env.APPLITOOLS_WAIT_BEFORE_SCREENSHOTS = '.someClass';
    const defaultConfig = {waitBeforeScreenshot: 50, waitBeforeScreenshots: 50};
    const config = generateConfig({defaultConfig});
    expect(config.waitBeforeScreenshot).to.eql('.someClass');
  });
});
