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
    const blobs = {
      url2: {url: 'url2', type: 'type', value: 'value'},
    };
    const extractResources = () => ({
      resourceUrls: ['url1'],
      blobs,
    });

    const domNodesToCdt = () => 'cdt';
    const logger = console;
    const getStoryData = makeGetStoryData({logger, extractResources, domNodesToCdt});
    const {name, resourceUrls, resourceContents, cdt, url} = await getStoryData(
      'name',
      'url',
      page,
    );

    expect(name).to.equal('name');
    expect(url).to.equal('url');
    expect(resourceUrls).to.eql(['url1']);
    expect(resourceContents).to.eql(blobs);
    expect(cdt).to.equal('cdt');
  });
});
