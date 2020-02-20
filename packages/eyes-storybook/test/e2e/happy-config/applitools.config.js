const path = require('path');

module.exports = {
  appName: 'Simple storybook',
  batchName: 'Simple storybook',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/appWithStorybook'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  include: ({name}) => !/^\[SKIP\]/.test(name),
  variations: ({name}) => {
    if (/should also do RTL/.test(name)) {
      return ['rtl'];
    }
  },
  // puppeteerOptions: {headless: false, devtools: true},
};
