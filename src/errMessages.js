'use strict';
const chalk = require('chalk');

const missingApiKeyFailMsg = `
${chalk.red('Environment variable APPLITOOLS_API_KEY is not set.')}
${chalk.green(`To fix:
1. Register for Applitools developer account at www.applitools.com/devreg
2. Get API key from menu
3. Set APPLITOOLS_API_KEY environment variable
  Mac/Linux: export APPLITOOLS_API_KEY=Your_API_Key_Here
  Windows: set APPLITOOLS_API_KEY=Your_API_Key_Here`)}`;

const missingAppNameAndPackageJsonFailMsg = `
  ${chalk.red(
    `App name is not defined. Normally we would take it by default from the package.json file located at the root of your project (${process.cwd()}), but the package.json file wasn't found.`,
  )}
  
  ${chalk.green(`To set an "appName", do one of the following:
Option 1: specify "appName" in the eyes.json file that should be placed in the current working directory.
Option 2: set an environment variable APPLITOOLS_APP_NAME.
Option 3: have a package.json file in the current working directory that has a "name" property. We'll take it from there.`)}
  
`;

const missingAppNameInPackageJsonFailMsg = `
${chalk.red(
  `App name is not defined. Normally we would take it by default from the package.json file located at the root of your project (${process.cwd()}), but the package.json file doesn't have a "name" property.`,
)}

${chalk.green(
  `To fix, add a "name" property to your package.json file located at ${process.cwd()}\n`,
)}

`;

const startStorybookFailMsg = chalk.red(
  'Could not find a storybook URL to test. This might be either because there was an error when starting the storybook dev server, or the parameter "storybookUrl" was not specified. Specify a URL with the "-u" parameter, or with "storybookUrl" in the config file (by default the config file is located at <project-folder>/applitools.config.js>).\n',
);

module.exports = {
  missingApiKeyFailMsg,
  missingAppNameAndPackageJsonFailMsg,
  missingAppNameInPackageJsonFailMsg,
  startStorybookFailMsg,
};
