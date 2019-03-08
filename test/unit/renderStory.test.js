'use strict';
const {describe, it, beforeEach} = require('mocha');
const {expect} = require('chai');
const makeRenderStory = require('../../src/renderStory');
const {presult} = require('@applitools/functional-commons');
const {makeTiming} = require('@applitools/monitoring-commons');
const psetTimeout = require('util').promisify(setTimeout);
const getStoryTitle = require('../../src/getStoryTitle');

describe('renderStory', () => {
  const logger = console;
  let performance, timeItAsync;

  beforeEach(() => {
    const timing = makeTiming();
    performance = timing.performance;
    timeItAsync = timing.timeItAsync;
  });

  it('calls openEyes, checkWindow and close with proper arguments and sets performance timing', async () => {
    const openEyes = async ({testName}) => {
      let _cdt, _resourceUrls, _resourceContents, _url;
      return {
        checkWindow: ({cdt, resourceUrls, resourceContents, url}) => {
          _cdt = cdt;
          _resourceUrls = resourceUrls;
          _resourceContents = resourceContents;
          _url = url;
        },
        close: async throwEx => {
          return {
            throwEx,
            cdt: _cdt,
            url: _url,
            resourceUrls: _resourceUrls,
            resourceContents: _resourceContents,
            testName,
          };
        },
      };
    };

    const renderStory = makeRenderStory({logger, openEyes, performance, timeItAsync});

    const cdt = 'cdt';
    const resourceUrls = 'resourceUrls';
    const resourceContents = 'resourceContents';
    const url = 'url';
    const name = 'name';
    const kind = 'kind';
    const title = getStoryTitle({name, kind});

    const results = await renderStory({name, kind, resourceUrls, resourceContents, cdt, url});

    expect(results).to.eql({
      throwEx: false,
      testName: title,
      url,
      cdt,
      resourceUrls,
      resourceContents,
    });

    expect(performance[title]).not.to.equal(undefined);
  });

  it('throws error during openEyes', async () => {
    const openEyes = async () => {
      await psetTimeout(0);
      throw new Error('bla');
    };

    const renderStory = makeRenderStory({logger, openEyes, performance, timeItAsync});
    const [{message}] = await presult(renderStory({}));
    expect(message).to.equal('bla');
  });

  it('handles error during close', async () => {
    let shouldThrow;
    const openEyes = async () => ({
      checkWindow() {},
      close: async throwEx => {
        shouldThrow = throwEx;
        await psetTimeout(0);
        return [new Error('bla')];
      },
    });

    const renderStory = makeRenderStory({logger, openEyes, performance, timeItAsync});
    const story = {name: 'name1', kind: 'kind'};
    const [{message}] = await renderStory(story);
    expect(message).to.equal('bla');
    expect(!!shouldThrow).to.be.false;
    console.log(performance);
    expect(performance[getStoryTitle(story)]).not.to.equal(undefined);
  });
});
