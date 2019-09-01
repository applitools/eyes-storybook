'use strict';

function browserLog({page, onLog}) {
  page.on('console', msg => {
    const text = msg.text();
    if (text.match(/\[dom-snapshot\]/)) {
      onLog(text);
    }
  });
}

module.exports = browserLog;
