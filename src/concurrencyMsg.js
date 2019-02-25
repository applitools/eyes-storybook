'use strict';
const chalk = require('chalk');

module.exports = chalk.yellow(
  `
Important notice: the Applitools visual tests are currently running with a concurrency value of 10.
This means that only up to 10 visual tests can run in parallel, and therefore the execution might be slow. This is the default behavior for free accounts.
If your account does support a higher level of concurrency, it's possible to pass a different value by specifying \`concurrency:X\` in the applitools.config.js file.
For more information on how to configure the concurrency level, visit the following link: https://www.npmjs.com/package/@applitools/eyes-storybook#concurrency.
If you are interested in speeding up your visual tests, contact sdr@applitools.com to get a trial account and a higher level of concurrency.`,
);
