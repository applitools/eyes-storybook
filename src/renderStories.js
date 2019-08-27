'use strict';
const getStoryUrl = require('./getStoryUrl');
const getStoryTitle = require('./getStoryTitle');
const ora = require('ora');

function makeRenderStories({
  getChunks,
  getStoryData,
  pages,
  renderStory,
  storybookBaseUrl,
  logger,
  stream = process.stderr,
}) {
  return async function renderStories(stories) {
    let doneStories = 0;
    const spinner = ora({text: `Done 0 stories out of ${stories.length}`, stream});
    spinner.start();
    const storyPromises = [];
    const chunks = getChunks(stories, pages.length);
    await Promise.all(
      chunks.map(async (chunk, i) => {
        for (const story of chunk) {
          const url = getStoryUrl(story, storybookBaseUrl);
          const storyDataPromise = getStoryData({url, page: pages[i]}).catch(e => {
            const errMsg = `Failed to get story data for "${getStoryTitle(story)}". ${e}`;
            logger.log(errMsg, e);
            return {error: new Error(errMsg)};
          });
          const storyRenderPromise = storyDataPromise
            .then(updateRunning)
            .then(({cdt, resourceUrls, resourceContents, frames, error}) =>
              !error
                ? renderStory({
                    cdt,
                    resourceUrls,
                    resourceContents,
                    frames,
                    url,
                    story,
                  })
                : error,
            )
            .then(onDoneStory, onDoneStory);
          storyPromises.push(storyRenderPromise);
          await storyDataPromise;
        }
      }),
    );

    const renderStoriesPromise = Promise.all(storyPromises);
    renderStoriesPromise.then(results =>
      results.every(didTestPass) ? stopSpinnerSuccess() : stopSpinnerFail(),
    );
    return renderStoriesPromise;

    function didTestPass(testResultsOrErr) {
      return (
        !(testResultsOrErr instanceof Error) &&
        testResultsOrErr.every(
          r => !(r instanceof Error) && r.getStatus && r.getStatus() === 'Passed',
        )
      );
    }

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
