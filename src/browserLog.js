'use strict';

function browserLog({page, onLog}) {
  page.on('console', msg => {
    onLog(msg.text());
  });
}

module.exports = browserLog;
