const getClientAPI = require('./storybookApi');

function renderStoryWithClientAPI(index) {
  const api = getClientAPI();
  if (!api) {
    return {message: 'error cannot get client api'};
  }

  try {
    api.selectStory(index);
  } catch (e) {
    return {message: `error cannot select story ${e.message}`, version: api.version};
  }
}

module.exports = renderStoryWithClientAPI;
