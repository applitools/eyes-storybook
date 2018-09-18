'use strict';
const {TestResultsFormatter} = require('@applitools/eyes.sdk.core');
const chalk = require('chalk');

const EYES_TEST_FAILED_EXIT_CODE = 130;

function processResults(results = []) {
  let outputStr = '';
  const formatter = new TestResultsFormatter();

  const testResults = results.filter(result => !(result instanceof Error));
  const errors = results.filter(result => result instanceof Error);

  let exitCode = errors.length ? EYES_TEST_FAILED_EXIT_CODE : 0;
  if (testResults.length > 0) {
    outputStr += '\n[EYES: TEST RESULTS]:\n';
    testResults.forEach(result => {
      formatter.addResults(result);

      const storyTitle = `${result.getName()} [${result.getHostDisplaySize().toString()}] - `;

      if (result.getIsNew()) {
        outputStr += `${storyTitle}${chalk.blue('New')}\n`;
      } else if (result.isPassed()) {
        outputStr += `${storyTitle}${chalk.green('Passed')}\n`;
      } else {
        const stepsFailed = result.getMismatches() + result.getMissing();
        outputStr += `${storyTitle}${chalk.red(`Failed ${stepsFailed} of ${result.getSteps()}`)}\n`;

        if (exitCode < EYES_TEST_FAILED_EXIT_CODE) {
          exitCode = EYES_TEST_FAILED_EXIT_CODE;
        }
      }
    });
  } else if (!errors.length) {
    outputStr += 'Test is finished but no results returned.\n';
  }

  if (errors.length) {
    outputStr += '\nThe following errors were found:\n';
    outputStr += errors.map(err => chalk.red(err.toString())).join('\n');
  }

  if (testResults[0]) {
    const diffCount = testResults.filter(result => !result.getIsNew() && !result.isPassed()).length;
    outputStr += `\nA total of ${diffCount} difference${diffCount > 1 ? 's were' : ' was'} found.`;
    outputStr += `\nSee details at ${testResults[0].getAppUrls().getBatch()}\n`;
  }

  return {
    outputStr,
    formatter,
    exitCode,
  };
}

module.exports = processResults;
