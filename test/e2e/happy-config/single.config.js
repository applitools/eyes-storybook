const path = require('path');

module.exports = {
  appName: 'Multi browser version',
  batchName: 'Simple storybook',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/singleStorybook'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [
    {width: 640, height: 480, name: 'chrome-one-version-back'},
    {width: 640, height: 480, name: 'chrome-two-versions-back'},
    {width: 640, height: 480, name: 'firefox-one-version-back'},
    // {width: 640, height: 480, name: 'firefox-two-versions-back'}, // TODO bring this back when Eyes 10.9 is out (baseline per browser version, a.k.a "the ping-pong problem")
  ],
};
