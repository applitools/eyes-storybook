/* global document */
const getClientAPI = require('./storybookApi');

function runRunBeforeScript(index) {
  const api = getClientAPI();
  if (!api) {
    console.log('error cannot get client api');
    return;
  }
  const story = api.getStories()[index];
  if (!story) {
    console.log('error cannot get story', index);
    return;
  }
  return story.parameters.eyes.runBefore({rootEl: document.getElementById('root'), story});
}

module.exports = runRunBeforeScript;
