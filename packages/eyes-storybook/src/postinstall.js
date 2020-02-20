const chalk = require('chalk');
const boxen = require('boxen');
console.log(
  boxen(
    `This is version 3 of ${chalk.cyan('@applitools/eyes-storybook')}.
This version includes a wide variety of performance improvements and features.
We recommend checking out the release notes:
${chalk.yellow('https://github.com/applitools/eyes-storybook/blob/v3.0.1/docs/release-notes-v3.md')}

If you experience a difference in behavior between v2 and v3, it's possible to opt out of the optimization
by configuring ${chalk.cyan('reloadTabPerStory')} to ${chalk.cyan(
      'true',
    )}. And, do read the release notes - they explain it perfectly :-)`,
    {padding: 1, borderColor: 'cyan', align: 'center'},
  ),
);
