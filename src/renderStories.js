'use strict';
const getStoryUrl = require('./getStoryUrl');
const ora = require('ora');

function makeRenderStories({getChunks, getStoryData, pages, renderStory, storybookUrl}) {
  return async function renderStories(stories) {
    let doneStories = 0;
    const spinner = ora(`Done 0 stories out of ${stories.length}`);
    spinner.start();
    const storyPromises = [];
    const chunks = getChunks(stories, pages.length);
    await Promise.all(
      chunks.map(async (chunk, i) => {
        for (const story of chunk) {
          const url = getStoryUrl(story, storybookUrl);
          const storyDataPromise = getStoryData({url, page: pages[i]}); // TODO handle error
          const storyRenderPromise = storyDataPromise
            .then(updateRunning)
            .then(({cdt, resourceUrls, resourceContents}) =>
              renderStory({
                cdt,
                resourceUrls,
                resourceContents,
                url,
                name: story.name,
                kind: story.kind,
              }),
            )
            .then(onDoneStory, onDoneStory);
          storyPromises.push(storyRenderPromise);
          await storyDataPromise;
        }
      }),
    );

    const renderStoriesPromise = Promise.all(storyPromises);
    renderStoriesPromise.then(stopSpinnerSuccess, stopSpinnerFail);
    return renderStoriesPromise;

    function updateRunning(data) {
      spinner.text = `Done ${doneStories} stories out of ${stories.length}`;
      return data;
    }

    function stopSpinnerSuccess() {
      spinner.succeed();
    }

    function stopSpinnerFail() {
      spinner.fail();
    }

    function onDoneStory(resultsOrErr) {
      spinner.text = `Done ${++doneStories} stories out of ${stories.length}`;
      return resultsOrErr;
    }
  };
}

module.exports = makeRenderStories;
