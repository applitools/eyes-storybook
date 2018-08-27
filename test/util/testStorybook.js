const {spawn} = require('child_process');
const {resolve} = require('path');
const fetch = require('node-fetch');
const {promisify: p} = require('util');
const psetTimeout = p(setTimeout);

async function testStorybook({port}) {
  const storybookPath = resolve(__dirname, '../fixtures/appWithStorybook');
  const proc = spawn('npx', ['start-storybook', '-c', storybookPath, '-p', port], {
    stdio: process.env.APPLITOOLS_SHOW_LOGS ? 'inherit' : 'ignore',
  });
  await waitForServer();

  return () => proc.kill();

  async function waitForServer() {
    try {
      await fetch(`http://localhost:${port}`);
    } catch (ex) {
      await psetTimeout(100);
      await waitForServer();
    }
  }
}

module.exports = testStorybook;
