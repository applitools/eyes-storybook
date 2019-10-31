'use strict';
const getStoryUrl = require('./getStoryUrl');
const getStoryTitle = require('./getStoryTitle');
const ora = require('ora');

function makeRenderStories({
  getStoryData,
  getFreePage,
  renderStory,
  storybookUrl,
  logger,
  stream,
  waitForQueuedRenders,
  storyDataGap,
}) {
  return async function renderStories(stories) {
    let doneStories = 0;

    const spinner = ora({text: `Done 0 stories out of ${stories.length}`, stream});
    spinner.start();

    const allTestResults = [];
    let allStoriesPromise = Promise.resolve();
    let currIndex = 0;

    await processStoryLoop();
    await allStoriesPromise;
    updateSpinnerEnd();
    return allTestResults;

    async function processStoryLoop() {
      if (currIndex === stories.length) return;
      const {page, pageId, markPageAsFree} = await getFreePage();
      logger.log(`[page ${pageId}] waiting for queued renders`);
      await waitForQueuedRenders(storyDataGap);
      logger.log(`[page ${pageId}] done waiting for queued renders`);
      const storyPromise = processStory();
      allStoriesPromise = allStoriesPromise.then(() => storyPromise);
      return processStoryLoop();

      function processStory() {
        const story = stories[currIndex++];
        const storyUrl = getStoryUrl(story, storybookUrl);
        const title = getStoryTitle(story);
        return getStoryData({story, storyUrl, page})
          .catch(e => {
            const errMsg = `[page ${pageId}] Failed to get story data for "${title}". ${e}`;
            logger.log(errMsg);
            return {error: new Error(errMsg)};
          })
          .then(({cdt, resourceUrls, resourceContents, frames, error}) => {
            markPageAsFree();
            return (
              error ||
              renderStory({
                cdt,
                resourceUrls,
                resourceContents,
                frames,
                url: storyUrl,
                story,
              })
            );
          })
          .then(onDoneStory, onDoneStory);
      }
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

    function onDoneStory(resultsOrErr) {
      spinner.text = `Done ${++doneStories} stories out of ${stories.length}`;
      allTestResults.push(resultsOrErr);
      return resultsOrErr;
    }
  };
}

module.exports = makeRenderStories;
