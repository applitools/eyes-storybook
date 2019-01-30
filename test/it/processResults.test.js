const {describe, it, before} = require('mocha');
const {expect} = require('chai');
const processResults = require('../../src/processResults');
const {TestResults} = require('@applitools/eyes-sdk-core/lib/TestResults');

describe('processResults', () => {
  let results;
  before(async () => {
    results = [
      {
        name: 'someName1',
        appName: 'someAppName1',
        hostDisplaySize: {width: 10, height: 20},
        appUrls: {step: 'step', stepEditor: 'stepEditor'},
      },
      {
        name: 'someName2',
        appName: 'someAppName2',
        hostDisplaySize: {width: 100, height: 200},
        appUrls: {step: 'step2', stepEditor: 'stepEditor2'},
      },
    ].map(result => new TestResults(result));
  });

  it('works', async () => {
    const processResult = processResults({results, totalTime: 10000, concurrency: 1});
    expect(JSON.stringify(processResult.formatter)).to.equal(
      JSON.stringify({
        _resultsList: [
          {
            name: 'someName1',
            appName: 'someAppName1',
            hostDisplaySize: {
              width: 10,
              height: 20,
            },
            appUrls: {},
          },
          {
            name: 'someName2',
            appName: 'someAppName2',
            hostDisplaySize: {
              width: 100,
              height: 200,
            },
            appUrls: {},
          },
        ],
      }),
    );
  });
});
