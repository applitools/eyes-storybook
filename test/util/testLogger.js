'use strict';

const {Logger} = require('@applitools/eyes-common');

module.exports = new Logger(process.env.APPLITOOLS_SHOW_LOGS);
