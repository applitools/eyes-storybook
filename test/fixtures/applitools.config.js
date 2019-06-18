module.exports = {
  appName: 'Simple storybook',
  batchName: 'Simple storybook',
  storybookConfigDir: 'test/fixtures/appWithStorybook/',
  storybookStaticDir: 'test/fixtures',
  storybookPort: 4567,
  puppeteerOptions: {headless: true},
  filterStories: ({name}) => !/^\[SKIP\]/.test(name),
  variations: ({name}) => {
    if (/should also do RTL/.test(name)) {
      return ['rtl'];
    }
  },
  // browser: [{width: 1000, height: 600, name: 'edge'}],
  // tapFilePath: './',
};
