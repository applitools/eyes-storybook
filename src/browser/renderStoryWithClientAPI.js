const getClientAPI = require('./storybookApi');

function renderStoryWithClientAPI(index) {
  let api;
  try {
    api = getClientAPI();
    api.selectStory(index);
  } catch (ex) {
    return {message: ex.message, version: api ? api.version : undefined};
  }
}

module.exports = renderStoryWithClientAPI;
