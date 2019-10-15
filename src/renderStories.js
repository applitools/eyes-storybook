'use strict';
const getStoryUrl = require('./getStoryUrl');
const getStoryTitle = require('./getStoryTitle');
const ora = require('ora');

function makeRenderStories({getStoryData, pages, renderStory, storybookUrl, logger, stream}) {
  return async function renderStories(stories) {
    let doneStories = 0;

    const spinner = ora({text: `Done 0 stories out of ${stories.length}`, stream});
    spinner.start();

    const allTestResults = [];
    let allStoriesPromise = Promise.resolve();
    let currIndex = 0;

    await Promise.all(pages.map(processStory));
    await allStoriesPromise;
    updateSpinnerEnd();
    return allTestResults;

    async function processStory(page) {
      if (currIndex === stories.length) return;

      const story = stories[currIndex++];
      const storyUrl = getStoryUrl(story, storybookUrl);
      const storyDataPromise = getStoryData({story, storyUrl, page}).catch(e => {
        const errMsg = `Failed to get story data for "${getStoryTitle(story)}". ${e}`;
        logger.log(errMsg);
        return {error: new Error(errMsg)};
      });

      const storyRenderPromise = storyDataPromise
        .then(updateRunning)
        .then(
          ({cdt, resourceUrls, resourceContents, frames, error}) =>
            error ||
            renderStory({
              cdt,
              resourceUrls,
              resourceContents,
              frames,
              url: storyUrl,
              story,
            }),
        )
        .then(onDoneStory, onDoneStory);

      allStoriesPromise = allStoriesPromise.then(() => storyRenderPromise);

      await storyDataPromise;
      return processStory(page);
    }

    function didTestPass(testResultsOrErr) {
      return (
        !(testResultsOrErr instanceof Error) &&
        testResultsOrErr.every(
          r => !(r instanceof Error) && r.getStatus && r.getStatus() === 'Passed',
        )
      );
    }

    function updateSpinnerEnd() {
      allTestResults.every(didTestPass) ? spinner.succeed() : spinner.fail();
    }

    function updateRunning(data) {
      spinner.text = `Done ${doneStories} stories out of ${stories.length}`;
      return data;
    }

    function onDoneStory(resultsOrErr) {
      spinner.text = `Done ${++doneStories} stories out of ${stories.length}`;
      allTestResults.push(resultsOrErr);
      return resultsOrErr;
    }
  };
}

module.exports = makeRenderStories;
