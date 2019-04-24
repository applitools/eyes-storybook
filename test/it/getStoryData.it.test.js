/* global window document */
const puppeteer = require('puppeteer');
const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const testServer = require('../util/testServer');
const makeGetStoryData = require('../../src/getStoryData');
const {ptimeoutWithError} = require('@applitools/functional-commons');

describe('getStoryData', () => {
  let browser, page, closeTestServer;
  before(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    const server = await testServer({port: 7272});
    closeTestServer = server.close;
    // page.on('console', msg => {
    //   console.log(msg.args().join(' '));
    // });
  });

  after(async () => {
    await browser.close();
    await closeTestServer();
  });

  it('works with waitBeforeScreenshots as a number', async () => {
    const processPageAndSerialize = () => ({
      resourceUrls: ['url1', window.timeout],
      blobs: [{url: 'url2', type: 'type', value: 'ss'}],
      cdt: 'cdt',
    });

    const logger = console;
    const getStoryData = makeGetStoryData({
      logger,
      processPageAndSerialize,
      waitBeforeScreenshots: 2000,
    });

    const getStoryPromise = getStoryData({
      url: 'http://localhost:7272/renderTimeoutNumber.html',
      page,
    });
    const {resourceUrls, resourceContents, cdt} = await ptimeoutWithError(
      getStoryPromise,
      3000,
      'timeout',
    );

    expect(resourceUrls).to.eql(['url1', 1500]);
    expect(resourceContents).to.eql([
      {url: 'url2', type: 'type', value: Buffer.from('ss', 'base64')},
    ]);
    expect(cdt).to.equal('cdt');
  });

  it('works with waitBeforeScreenshots as a css selector', async () => {
    const processPageAndSerialize = () => ({
      resourceUrls: [
        'url1',
        document.getElementById('newDiv') && document.getElementById('newDiv').innerText,
      ],
      blobs: [{url: 'url2', type: 'type', value: 'ss'}],
      cdt: 'cdt',
    });

    const logger = console;
    const getStoryData = makeGetStoryData({
      logger,
      processPageAndSerialize,
      waitBeforeScreenshots: '#newDiv',
    });

    const getStoryPromise = getStoryData({
      url: 'http://localhost:7272/renderTimeoutSelector.html',
      page,
    });
    const {resourceUrls, resourceContents, cdt} = await ptimeoutWithError(
      getStoryPromise,
      3000,
      'timeout',
    );

    expect(resourceUrls).to.eql(['url1', 'div created']);
    expect(resourceContents).to.eql([
      {url: 'url2', type: 'type', value: Buffer.from('ss', 'base64')},
    ]);
    expect(cdt).to.equal('cdt');
  });

  it('works with waitBeforeScreenshots as a function', async () => {
    const processPageAndSerialize = () => ({
      resourceUrls: ['url1', document.getElementById('changeME').innerText],
      blobs: [{url: 'url2', type: 'type', value: 'ss'}],
      cdt: 'cdt',
    });

    const logger = console;
    const getStoryData = makeGetStoryData({
      logger,
      processPageAndSerialize,
      waitBeforeScreenshots: () => window.ready === 'ok',
    });

    const getStoryPromise = getStoryData({
      url: 'http://localhost:7272/renderTimeoutFunction.html',
      page,
    });
    const {resourceUrls, resourceContents, cdt} = await ptimeoutWithError(
      getStoryPromise,
      3000,
      'timeout',
    );

    expect(resourceUrls).to.eql(['url1', '1500 ms passed']);
    expect(resourceContents).to.eql([
      {url: 'url2', type: 'type', value: Buffer.from('ss', 'base64')},
    ]);
    expect(cdt).to.equal('cdt');
  });
});
