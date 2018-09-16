'use strict';
const {TestResultsFormatter} = require('@applitools/eyes.sdk.core');
const chalk = require('chalk');

const EYES_TEST_FAILED_EXIT_CODE = 130;

function processResults(results) {
  const formatter = new TestResultsFormatter();

  const testResults = results.filter(result => !(result instanceof Error));
  const errors = results.filter(result => result instanceof Error);

  let exitCode = errors.length ? EYES_TEST_FAILED_EXIT_CODE : 0;
  if (testResults.length > 0) {
    console.log('\n[EYES: TEST RESULTS]:');
    testResults.forEach(result => {
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
  } else if (!errors.length) {
    console.log('Test is finished but no results returned.');
  }

  if (errors.length) {
    console.log('\nThe following errors were found:');
    console.log(errors.map(err => chalk.red(err.toString())).join('\n'));
  }

  if (testResults[0]) {
    console.log('\nSee details at', testResults[0].getAppUrls().getBatch());
  }

  return {
    formatter,
    exitCode,
  };
}

module.exports = processResults;
