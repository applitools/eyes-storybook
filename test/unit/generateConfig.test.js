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
});
