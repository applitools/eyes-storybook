module.exports = {
  appName: 'Simple storybook',
  batchName: 'Simple storybook',
  storybookUrl: 'http://localhost:9001?path=/story/*', // TODO it tests for eyeStorybook using fake servers to check param behavior
  include: ({name}) => !/^\[SKIP\]/.test(name),
  variations: ({name}) => {
    if (/should also do RTL/.test(name)) {
      return ['rtl'];
    }
  },
  // puppeteerOptions: {headless: false, devtools: true},
};
