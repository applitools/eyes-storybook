const getClientAPI = require('./storybookApi');

function renderStoryWithClientAPI(index) {
  const api = getClientAPI();
  if (!api) {
    console.log('error cannot get client api');
    return;
  }
  api.selectStory(index);
}

module.exports = renderStoryWithClientAPI;
