'use strict';

const {describe, it} = require('mocha');
const {expect} = require('chai');
const makeRenderStories = require('../../src/renderStories');
const getChunks = require('../../src/getChunks');
const getStoryTitle = require('../../src/getStoryTitle');
const {PassThrough} = require('stream');
const stripAnsi = require('strip-ansi');

const testStream = () => {
  const events = [];
  const noop = () => {};
  const stream = new PassThrough();
  stream.clearLine = noop;
  stream.cursorTo = noop;
  stream.moveCursor = noop;
  stream.on('data', data => {
    events.push(stripAnsi(data.toString()));
  });
  return {
    stream,
    getEvents() {
      return events;
    },
  };
};

describe('renderStories', () => {
  it('returns empty array for 0 stories', async () => {
    const {stream, getEvents} = testStream();
    const renderStories = makeRenderStories({
      getChunks,
      pages: [1],
      stream,
    });

    const results = await renderStories([]);

    expect(results).to.eql([]);
    expect(getEvents()).to.eql(['- Done 0 stories out of 0\n', '✔ Done 0 stories out of 0\n']);
  });

  it('returns results from renderStory', async () => {
    const getStoryData = async ({url, page}) => ({
      cdt: `cdt_${url}_${page}`,
      resourceUrls: `resourceUrls_${url}_${page}`,
      resourceContents: `resourceContents_${url}_${page}`,
      frames: `frames_${url}_${page}`,
    });

    const renderStory = async arg => [{arg, getStatus: () => 'Passed'}];

    const pages = [1, 2, 3];
    const storybookBaseUrl = 'http://something';
    const logger = console;
    const {stream, getEvents} = testStream();

    const renderStories = makeRenderStories({
      getChunks,
      getStoryData,
      pages,
      renderStory,
      storybookBaseUrl,
      logger,
      stream,
    });

    const results = await renderStories([{name: 's1', kind: 'k1'}]);

    expect(JSON.stringify(results)).to.eql(
      JSON.stringify([
        [
          {
            arg: {
              cdt:
                'cdt_http://something/iframe.html?selectedKind=k1&selectedStory=s1&eyes-storybook=true_1',
              resourceUrls:
                'resourceUrls_http://something/iframe.html?selectedKind=k1&selectedStory=s1&eyes-storybook=true_1',
              resourceContents:
                'resourceContents_http://something/iframe.html?selectedKind=k1&selectedStory=s1&eyes-storybook=true_1',
              frames:
                'frames_http://something/iframe.html?selectedKind=k1&selectedStory=s1&eyes-storybook=true_1',
              url:
                'http://something/iframe.html?selectedKind=k1&selectedStory=s1&eyes-storybook=true',
              story: {name: 's1', kind: 'k1'},
            },
          },
        ],
      ]),
    );

    expect(getEvents()).to.eql(['- Done 0 stories out of 1\n', '✔ Done 1 stories out of 1\n']);
  });

  it('returns errors from getStoryData', async () => {
    const getStoryData = async () => {
      throw new Error('bla');
    };

    const renderStory = async () => {};

    const pages = [1, 2, 3];
    const storybookUrl = 'http://something';
    const logger = {log: () => {}};
    const {stream, getEvents} = testStream();

    const renderStories = makeRenderStories({
      getChunks,
      getStoryData,
      pages,
      renderStory,
      storybookUrl,
      logger,
      stream,
    });

    const story = {name: 's1', kind: 'k1'};
    const results = await renderStories([story]);

    expect(results[0]).to.be.an.instanceOf(Error);
    expect(results[0].message).to.equal(
      `Failed to get story data for "${getStoryTitle(story)}". Error: bla`,
    );

    expect(getEvents()).to.eql(['- Done 0 stories out of 1\n', '✖ Done 1 stories out of 1\n']);
  });

  it('returns errors from renderStory', async () => {
    const getStoryData = async () => ({});

    const renderStory = async () => {
      throw new Error('bla');
    };

    const pages = [1, 2, 3];
    const storybookUrl = 'http://something';
    const logger = {log: () => {}};
    const {stream, getEvents} = testStream();

    const renderStories = makeRenderStories({
      getChunks,
      getStoryData,
      pages,
      renderStory,
      storybookUrl,
      logger,
      stream,
    });

    const story = {name: 's1', kind: 'k1'};
    const results = await renderStories([story]);

    expect(results[0]).to.be.an.instanceOf(Error);
    expect(results[0].message).to.equal('bla');

    expect(getEvents()).to.eql(['- Done 0 stories out of 1\n', '✖ Done 1 stories out of 1\n']);
  });
});
