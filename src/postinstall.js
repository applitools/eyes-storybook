const chalk = require('chalk');
const boxen = require('boxen');
console.log(
  boxen(
    `This is version 3 of ${chalk.cyan('@applitools/eyes-storybook')}.
This version includes a wide variety of performance improvements and features.
We recommend checking out the release notes:
${chalk.yellow(
  'https://github.com/applitools/eyes-storybook/blob/v3.0.0/docs/release-notes-v3.md',
)}`,
    {padding: 1, borderColor: 'cyan', align: 'center'},
  ),
);
