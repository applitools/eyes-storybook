const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const {promisify: p} = require('util');
const {spawn} = require('child_process');
const {resolve} = require('path');
const psetTimeout = p(setTimeout);
const getStories = require('../../src/getStories');

async function waitForServer() {
  try {
    await fetch('http://localhost:9001');
  } catch (ex) {
    await psetTimeout(100);
    await waitForServer();
  }
}

describe('getStories', () => {
  let proc;
  before(async () => {
    proc = spawn(
      'npx',
      ['start-storybook', '-c', resolve(__dirname, 'fixtures/appWithStorybook'), '-p', '9001'],
      {
        stdio: process.env.APPLITOOLS_SHOW_LOGS ? 'inherit' : 'ignore',
      },
    );
    await waitForServer();
  });

  after(async () => {
    proc.kill();
  });

  let browser, page;

  before(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  after(async () => {
    await browser.close();
  });

  it('gets stories without nesting', async () => {
    await page.goto('http://localhost:9001');
    const stories = await page.evaluate(getStories);
    expect(stories).to.eql([
      {name: 'with text', kind: 'Button'},
      {name: 'with some emoji', kind: 'Button'},
      {name: 'story 1', kind: 'Nested'},
      {name: 'story 1.1', kind: 'Nested/Component'},
      {name: 'story 1.2', kind: 'Nested/Component'},
    ]);
  });
});
