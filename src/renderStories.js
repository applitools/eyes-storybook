'use strict';
const getStoryTitle = require('./getStoryTitle');
const getStoryUrl = require('./getStoryUrl');

function makeRenderStories({getChunks, getStoryData, pages, renderStory, ora, storybookUrl}) {
  return async function renderStories(stories) {
    let runningStories = 0;
    let doneStories = 0;
    const spinner = ora(`Done 0 stories out of ${stories.length}`);
    spinner.start();
    const storyPromises = [];
    const chunks = getChunks(stories, pages.length);
    await Promise.all(
      chunks.map(async (chunk, i) => {
        for (const story of chunk) {
          const name = getStoryTitle(story);
          const url = getStoryUrl(story, storybookUrl);
          const storyDataPromise = getStoryData(name, url, pages[i]); // TODO handle error
          const storyRenderPromise = storyDataPromise
            .then(updateRunning)
            .then(renderStory)
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
      ++runningStories;
      spinner.text = `Done ${doneStories} stories out of ${stories.length}${currentlyRunning()}`;
      return data;
    }

    function stopSpinnerSuccess() {
      spinner.succeed();
    }

    function stopSpinnerFail() {
      spinner.fail();
    }

    function onDoneStory(resultsOrErr) {
      --runningStories;
      spinner.text = `Done ${++doneStories} stories out of ${stories.length}${currentlyRunning()}`;
      return resultsOrErr;
    }

    function currentlyRunning() {
      return runningStories ? ` (currently running ${runningStories} stories)` : '';
    }
  };
}

module.exports = makeRenderStories;
