'use strict';
const {TestResultsFormatter} = require('@applitools/eyes.sdk.core');
const chalk = require('chalk');

const EYES_TEST_FAILED_EXIT_CODE = 130;

function processResults(results) {
  const formatter = new TestResultsFormatter();

  let exitCode = 0;
  if (results.length > 0) {
    console.log('\n[EYES: TEST RESULTS]:');
    results.forEach(result => {
      formatter.addResults(result);

      const storyTitle = `${result.getName()} [${result.getHostDisplaySize().toString()}] - `;

      if (result.getIsNew()) {
        console.log(storyTitle, chalk.blue('New'));
      } else if (result.isPassed()) {
        console.log(storyTitle, chalk.green('Passed'));
      } else {
        const stepsFailed = result.getMismatches() + result.getMissing();
        console.log(storyTitle, chalk.red(`Failed ${stepsFailed} of ${result.getSteps()}`));

        if (exitCode < EYES_TEST_FAILED_EXIT_CODE) {
          exitCode = EYES_TEST_FAILED_EXIT_CODE;
        }
      }
    });
    console.log('See details at', results[0].getAppUrls().getBatch());
  } else {
    console.log('Test is finished but no results returned.');
  }

  return {
    formatter,
    exitCode,
  };
}

module.exports = processResults;
