/* global document */
const getClientAPI = require('./getClientAPI');

function runRunBeforeScript(index) {
  let api;
  try {
    api = getClientAPI();
    const story = api.getStories()[index];
    if (!story) {
      console.log('error cannot get story', index);
      return;
    }
    return story.parameters.eyes.runBefore({rootEl: document.getElementById('root'), story});
  } catch (ex) {
    return {message: ex.message, version: api ? api.version : undefined};
  }
}

module.exports = runRunBeforeScript;
