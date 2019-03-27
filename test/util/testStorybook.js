const {spawn} = require('child_process');
const {resolve} = require('path');
const {waitForStorybook} = require('../../src/startStorybookServer');
const fs = require('fs');

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

  const storybookPackage = fs.readFileSync('node_modules/@storybook/core/package.json', 'utf8');
  const storybookVersion = JSON.parse(storybookPackage).version;
  await waitForStorybook(proc, storybookVersion);

  return () => proc.kill();
}

module.exports = testStorybook;
