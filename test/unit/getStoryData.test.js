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
      waitBeforeScreenshot: 50,
    });
    const {resourceUrls, resourceContents, cdt} = await getStoryData({url: 'url', page});

    expect(resourceUrls).to.eql(['url1']);
    expect(resourceContents).to.eql(expectedResourceContents);
    expect(cdt).to.equal('cdt');
  });

  it('waitsFor correctly with waitBeforeScreenshot before taking the screenshot', async () => {
    let waitedValue;
    const waitBeforeScreenshot = 'someValue';
    const page = {
      goto: async () => {},
      waitFor: async value => {
        waitedValue = value;
      },
      evaluate: func =>
        waitedValue === waitBeforeScreenshot
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
      waitBeforeScreenshot,
    });

    const {resourceUrls, resourceContents, cdt} = await getStoryData({
      url: 'url',
      page,
    });

    expect(resourceUrls).to.eql(['url1']);
    expect(resourceContents).to.eql(expectedResourceContents);
    expect(cdt).to.equal('cdt');
  });

  it('waitsFor correctly with waitBeforeScreenshot before taking a component screenshot', async () => {
    let waitedValue;
    const waitBeforeScreenshot = 'someValue';
    const page = {
      goto: async () => {},
      waitFor: async value => {
        waitedValue = value;
      },
      evaluate: func =>
        waitedValue === waitBeforeScreenshot
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
      waitBeforeScreenshot: 2000,
    });

    const {resourceUrls, resourceContents, cdt} = await getStoryData({
      url: 'url',
      page,
      waitBeforeStory: waitBeforeScreenshot,
    });

    expect(resourceUrls).to.eql(['url1']);
    expect(resourceContents).to.eql(expectedResourceContents);
    expect(cdt).to.equal('cdt');
  });

  it('throws when getting a negative waitBeforeScreenshot', async () => {
    const page = {
      goto: async () => {},
      waitFor: async () => {},
      evaluate: func => Promise.resolve(func()),
    };
    const valueBuffer = Buffer.from('value');
    const blobs = [{url: 'url2', type: 'type', value: valueBuffer.toString('base64')}];
    const processPageAndSerialize = () => ({
      resourceUrls: ['url1'],
      blobs,
      cdt: 'cdt',
    });

    const logger = console;
    const getStoryData = makeGetStoryData({
      logger,
      processPageAndSerialize,
      waitBeforeScreenshot: 50,
    });
    let err;
    try {
      await getStoryData({url: 'url', page, waitBeforeStory: -5});
    } catch (e) {
      err = e;
    }
    expect(err.message).to.eql('IllegalArgument: waitBeforeScreenshot < 0');
  });

  it('throws when getting a negative waitBeforeScreenshot', async () => {
    const page = {
      goto: async () => {},
      waitFor: async () => {},
      evaluate: func => Promise.resolve(func()),
    };
    const valueBuffer = Buffer.from('value');
    const blobs = [{url: 'url2', type: 'type', value: valueBuffer.toString('base64')}];
    const processPageAndSerialize = () => ({
      resourceUrls: ['url1'],
      blobs,
      cdt: 'cdt',
    });

    const logger = console;
    const getStoryData = makeGetStoryData({
      logger,
      processPageAndSerialize,
      waitBeforeScreenshot: -50,
    });
    let err;
    try {
      await getStoryData({url: 'url', page});
    } catch (e) {
      err = e;
    }
    expect(err.message).to.eql('IllegalArgument: waitBeforeScreenshot < 0');
  });
});
