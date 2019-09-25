
function __runRunBeforeScript(...args) {
  var runRunBeforeScript = (function () {
  'use strict';

  /* global window */

  const API_VERSIONS = {
    v4: 'v4',
    v5: 'v5',
    v5_2: 'v5_2',
  };

  function getClientAPI() {
    const frameWindow = getFrameWindow();
    const clientAPI = frameWindow && frameWindow.__STORYBOOK_CLIENT_API__;
    const addons = frameWindow && frameWindow.__STORYBOOK_ADDONS;

    return getAPI(getStorybookVersion());

    function getStorybookVersion() {
      if (frameWindow) {
        const addons = frameWindow.__STORYBOOK_ADDONS;

        if (frameWindow.__STORYBOOK_STORY_STORE__) {
          return API_VERSIONS.v5_2;
        } else if (frameWindow.__STORYBOOK_CLIENT_API__ && frameWindow.__STORYBOOK_CLIENT_API__.raw) {
          return API_VERSIONS.v5;
        } else if (
          addons &&
          addons.channel &&
          addons.channel._listeners &&
          addons.channel._listeners.setCurrentStory &&
          addons.channel._listeners.setCurrentStory[0]
        ) {
          return API_VERSIONS.v4;
        }
      }
    }

    function getAPI(version) {
      if (version) {
        let api;
        switch (version) {
          case API_VERSIONS.v4: {
            api = {
              getStories: () => {
                if (!frameWindow.__APPLITOOLS_STORIES) {
                  frameWindow.__APPLITOOLS_STORIES = Object.values(clientAPI._storyStore._data)
                    .map(({stories, kind}) => Object.values(stories).map(s => ({...s, kind})))
                    .flat();
                }
                return frameWindow.__APPLITOOLS_STORIES;
              },
              selectStory: i => {
                const {kind, name: story} = api.getStories()[i];
                addons.channel._listeners.setCurrentStory[0]({kind, story});
              },
            };
            break;
          }

          case API_VERSIONS.v5: {
            api = {
              getStories: () => {
                return clientAPI.raw();
              },
              selectStory: i => {
                clientAPI._storyStore.setSelection(clientAPI.raw()[i]);
              },
            };
            break;
          }

          case API_VERSIONS.v5_2: {
            api = {
              getStories: () => {
                return clientAPI.raw();
              },
              selectStory: i => {
                frameWindow.__STORYBOOK_STORY_STORE__.setSelection({storyId: clientAPI.raw()[i].id});
              },
            };
            break;
          }
        }

        return {version, ...api};
      }
    }
  }

  function getFrameWindow() {
    if (/iframe.html/.test(window.location.href)) {
      return window;
    }
    return Array.prototype.filter.call(window.frames, frame => {
      try {
        return /\/iframe.html/.test(frame.location.href);
      } catch (e) {}
    })[0];
  }

  var storybookApi = getClientAPI;

  /* global document */


  function runRunBeforeScript(index) {
    const api = storybookApi();
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

  var runRunBeforeScript_1 = runRunBeforeScript;

  return runRunBeforeScript_1;

}());

  return runRunBeforeScript.apply(this, args);
}
module.exports = __runRunBeforeScript
