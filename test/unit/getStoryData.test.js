'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const makeGetStoryData = require('../../src/getStoryData');

describe('getStoryData', () => {
  it('works', async () => {
    const page = {
      goto: async () => {},
      waitFor: async () => {},
      evaluate: func => Promise.resolve(func()),
    };
    const valueBuffer = Buffer.from('value');
    const blobs = [{url: 'url2', type: 'type', value: valueBuffer.toString('base64')}];
    const expectedResourceContents = [{url: 'url2', type: 'type', value: valueBuffer}];
    const processPageAndSerialize = () => ({
      resourceUrls: ['url1'],
      blobs,
      cdt: 'cdt',
    });

    const logger = console;
    const getStoryData = makeGetStoryData({
      logger,
      processPageAndSerialize,
      waitBeforeScreenshots: 50,
    });
    const {resourceUrls, resourceContents, cdt} = await getStoryData({url: 'url', page});

    expect(resourceUrls).to.eql(['url1']);
    expect(resourceContents).to.eql(expectedResourceContents);
    expect(cdt).to.equal('cdt');
  });

  it('waits waitBeforeScreenshots before taking the screen shot', async () => {
    let waited;
    const page = {
      goto: async () => {},
      waitFor: async ms => {
        waited = ms;
      },
      evaluate: func =>
        waited === 1100
          ? Promise.resolve(func())
          : Promise.reject('did not wait enough before taking snapshot'),
    };

    const valueBuffer = Buffer.from('value');
    const blobs = [{url: 'url2', type: 'type', value: valueBuffer.toString('base64')}];
    const expectedResourceContents = [{url: 'url2', type: 'type', value: valueBuffer}];
    const processPageAndSerialize = () => ({
      resourceUrls: ['url1'],
      blobs,
      cdt: 'cdt',
    });
    const logger = console;
    const getStoryData = makeGetStoryData({
      logger,
      processPageAndSerialize,
      waitBeforeScreenshots: 1100,
    });

    const {resourceUrls, resourceContents, cdt} = await getStoryData({
      url: 'url',
      page,
    });

    expect(resourceUrls).to.eql(['url1']);
    expect(resourceContents).to.eql(expectedResourceContents);
    expect(cdt).to.equal('cdt');
  });

  it('throws when getting a negative waitBeforeScreenshots', async () => {
    expect(() =>
      makeGetStoryData({
        waitBeforeScreenshots: -5,
      }),
    ).to.throw('waitBeforeScreenshots');
  });

  it('throws when not getting waitBeforeScreenshots', async () => {
    expect(() =>
      makeGetStoryData({
        waitBeforeScreenshots: -5,
      }),
    ).to.throw('waitBeforeScreenshots');
  });
});
