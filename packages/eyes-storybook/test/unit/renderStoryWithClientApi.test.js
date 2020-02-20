'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const puppeteer = require('puppeteer');

const renderStoryWithClientAPI = require('../../dist/renderStoryWithClientAPI');

describe('renderStoryWithClientAPI', () => {
  it('returns an error when fails to get client api', async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    try {
      const err = await page.evaluate(renderStoryWithClientAPI);
      expect(err.message).to.equal('Cannot get client API: no frameWindow');
    } finally {
      await browser.close();
    }
  });
});
