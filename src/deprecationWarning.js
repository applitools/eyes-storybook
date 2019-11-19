const chalk = require('chalk');

function deprecationWarning(deprecatedThing, newThing) {
  return chalk.yellow(
    `Warning: ${deprecatedThing} is deprecated. Please use ${newThing} instead.\n`,
  );
}

module.exports = deprecationWarning;
