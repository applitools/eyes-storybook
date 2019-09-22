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
    browser = await puppeteer.launch(); // {headless: false, devtools: true}
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

  it('gets stories', async () => {
    await page.goto('http://localhost:9001');
    const stories = await page.evaluate(getStories);
    expect(stories).to.eql(
      [
        {
          name: 'with text',
          kind: 'Button',
          parameters: {
            someParam: 'i was here, goodbye',
            eyes: {ignore: [{selector: '.ignore-this'}]},
          },
        },
        {
          name: 'with some emoji',
          kind: 'Button',
          error: `Ignoring parameters for story: "with some emoji Button" ! since they are not serilizable, error: "Converting circular structure to JSON\n    --> starting at object with constructor 'Object'\n    --- property 'inner' closes the circle"`,
        },
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
        {name: 'story 1.1', kind: 'SOME section|Nested/Component'},
        {name: 'story 1.2', kind: 'SOME section|Nested/Component'},
        {
          name: 'c yes-a b',
          kind: 'Wow|one with-space yes-indeed/nested with-space yes/nested again-yes a',
        },
        {name: 'should also do RTL', kind: 'RTL'},
        {name: 'local RTL config', kind: 'RTL', parameters: {eyes: {variations: ['rtl']}}},
        {
          name:
            'this story should not be checked visually by eyes-storybook because of local parameter',
          kind: 'skipped tests',
          parameters: {eyes: {include: false}},
        },
        {
          name:
            '[SKIP] this story should not be checked visually by eyes-storybook because of global config',
          kind: 'skipped tests',
        },
      ].map(({name, kind, parameters, error}) => {
        const res = {
          name,
          kind,
        };
        if (!error) {
          res.parameters = {
            fileName: './test/fixtures/appWithStorybook/index.js',
            framework: 'react',
            options: {
              hierarchyRootSeparator: '|',
              hierarchySeparator: {},
            },
            ...parameters,
          };
        } else {
          res.error = error;
        }

        return res;
      }),
    );
  });
});
