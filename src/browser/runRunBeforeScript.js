/* global document, __STORYBOOK_CLIENT_API__ */

function runRunBeforeScript(index) {
  const story = __STORYBOOK_CLIENT_API__.raw()[index];
  return story.parameters.eyes.runBefore({rootEl: document.getElementById('root'), story});
}

module.exports = runRunBeforeScript;
