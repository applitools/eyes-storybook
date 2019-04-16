const puppeteer = require('puppeteer');
const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const testServer = require('../util/testServer');
const testStorybook = require('../util/testStorybook');
const getStories = require('../../src/getStories');

describe('getStories', () => {
  let closeStorybook;
  before(async () => {
    closeStorybook = await testStorybook({port: 9001});
  });

  after(async () => {
    closeStorybook();
  });

  let browser, page;
  before(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    // page.on('console', msg => {
    //   console.log(msg.args().join(' '));
    // });
  });

  after(async () => {
    await browser.close();
  });

  let closeTestServer;
  before(async () => {
    const server = await testServer({port: 7272});
    closeTestServer = server.close;
  });

  after(async () => {
    await closeTestServer();
  });

  it('gets stories without nesting', async () => {
    await page.goto('http://localhost:9001');
    const stories = await page.evaluate(getStories);
    expect(stories).to.eql([
      {name: 'story 1.1', kind: 'SOME SECTION|Nested/Component'},
      {name: 'story 1.2', kind: 'SOME SECTION|Nested/Component'},
      {
        name: 'c yes-a b',
        kind: 'WOW|one with-space yes-indeed/nested with-space yes/nested again-yes a',
      },
      {name: 'with text', kind: 'Button'},
      {name: 'with some emoji', kind: 'Button'},
      {name: 'image', kind: 'Image'},
      {name: 'story 1', kind: 'Nested'},
      {name: 'story 1.1', kind: 'Nested/Component'},
      {name: 'story 1.2', kind: 'Nested/Component'},
      {name: 'a yes-a b', kind: 'Button with-space yes-indeed'},
      {name: 'b yes-a b', kind: 'Button with-space yes-indeed/nested with-space yes'},
      {
        name: 'c yes-a b',
        kind: 'Button with-space yes-indeed/nested with-space yes/nested again-yes a',
      },
    ]);
  });
});
