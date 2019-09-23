'use strict';

function browserLog({page, onLog, filter}) {
  page.on('console', msg => {
    const text = msg.text();
    if (!filter || filter(text)) {
      onLog(text);
    }
  });
}

module.exports = browserLog;
