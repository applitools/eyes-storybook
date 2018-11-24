'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const makeGetStoryData = require('../../src/getStoryData');

describe('getStoryData', () => {
  it('works', async () => {
    const page = {
      goto: async () => {},
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
    const getStoryData = makeGetStoryData({logger, processPageAndSerialize});
    const {resourceUrls, resourceContents, cdt} = await getStoryData({url: 'url', page});

    expect(resourceUrls).to.eql(['url1']);
    expect(resourceContents).to.eql(expectedResourceContents);
    expect(cdt).to.equal('cdt');
  });
});
