const {describe, it, before, after} = require('mocha');
const {expect: _expect} = require('chai');
const testServer = require('../util/testServer');
const testStorybook = require('../util/testStorybook');
const eyesStorybook = require('../../src/eyesStorybook');

describe('eyes-storybook', () => {
  let closeStorybook;
  before(async () => {
    closeStorybook = await testStorybook({port: 9001});
  });

  after(async () => {
    closeStorybook();
  });

  let closeTestServer;
  before(async () => {
    const server = await testServer({port: 7272});
    closeTestServer = server.close;
  });

  after(async () => {
    await closeTestServer();
  });

  it('renders test storybook', async () => {
    await eyesStorybook('http://localhost:9001');
  });
});
