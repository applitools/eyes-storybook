const {spawn} = require('child_process');
const {resolve} = require('path');
const {waitForStorybook} = require('../../src/startStorybookServer');

async function testStorybook({port}) {
  const storybookPath = resolve(__dirname, '../fixtures/appWithStorybook');
  const proc = spawn('npx', [
    'start-storybook',
    '-c',
    storybookPath,
    '-p',
    port,
    '-s',
    'test/fixtures',
    '--ci',
  ]);
  await waitForStorybook(proc, './');

  return () => proc.kill();
}

module.exports = testStorybook;
