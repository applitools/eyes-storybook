/* global __STORYBOOK_CLIENT_API__*/

function renderStoryWithClientAPI(index) {
  __STORYBOOK_CLIENT_API__._storyStore.setSelection(__STORYBOOK_CLIENT_API__.raw()[index]);
}

module.exports = renderStoryWithClientAPI;
