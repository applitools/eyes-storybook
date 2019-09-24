const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const testStorybook = require('../util/testStorybook');
const path = require('path');
const testServer = require('../util/testServer');
const {delay: psetTimeout, presult} = require('@applitools/functional-commons');
const {sh} = require('@applitools/process-commons');
const {version} = require('../../package.json');

describe('eyes-storybook', () => {
  let closeStorybook;
  before(async () => {
    closeStorybook = await testStorybook({port: 9001});
  });

  after(() => {
    return closeStorybook();
  });

  let closeTestServer;
  before(async () => {
    closeTestServer = (await testServer({port: 7272})).close;
  });

  after(async () => {
    await closeTestServer();
  });

  it('renders test storybook', async () => {
    const {stdout, stderr} = await sh(
      `npx eyes-storybook -f ${path.resolve(__dirname, 'happy-config/applitools.config.js')}`,
      {spawnOptions: {stdio: 'pipe'}},
    );

    const normalizedStdout = stdout
      .replace(
        /See details at https\:\/\/eyes.applitools.com\/app\/test-results\/.+/,
        'See details at <some_url>',
      )
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds');

    expect(normalizedStdout).to.equal(`Using @applitools/eyes-storybook version ${version}.


[EYES: TEST RESULTS]:
Button with-space yes-indeed: a yes-a b [1024x768] - Passed
Button with-space yes-indeed/nested with-space yes: b yes-a b [1024x768] - Passed
Button with-space yes-indeed/nested with-space yes/nested again-yes a: c yes-a b [1024x768] - Passed
Button: with some emoji [1024x768] - Passed
Button: with text [1024x768] - Passed
Image: image [1024x768] - Passed
Interaction: Popover [1024x768] - Passed
Nested: story 1 [1024x768] - Passed
Nested/Component: story 1.1 [1024x768] - Passed
Nested/Component: story 1.2 [1024x768] - Passed
RTL: local RTL config [1024x768] - Passed
RTL: local RTL config [rtl] [1024x768] - Passed
RTL: should also do RTL [1024x768] - Passed
RTL: should also do RTL [rtl] [1024x768] - Passed
SOME section|Nested/Component: story 1.1 [1024x768] - Passed
SOME section|Nested/Component: story 1.2 [1024x768] - Passed
Wow|one with-space yes-indeed/nested with-space yes/nested again-yes a: c yes-a b [1024x768] - Passed

No differences were found!

See details at <some_url>
Total time: <some_time> seconds


Important notice: the Applitools visual tests are currently running with a concurrency value of 10.
This means that only up to 10 visual tests can run in parallel, and therefore the execution might be slow. This is the default behavior for free accounts.
If your account does support a higher level of concurrency, it's possible to pass a different value by specifying \`concurrency:X\` in the applitools.config.js file.
For more information on how to configure the concurrency level, visit the following link: https://www.npmjs.com/package/@applitools/eyes-storybook#concurrency.
If you are interested in speeding up your visual tests, contact sdr@applitools.com to get a trial account and a higher level of concurrency.

`);

    expect(stderr).to.equal(`- Reading stories
✔ Reading stories
- Done 0 stories out of 17
✔ Done 17 stories out of 17
`);
  });

  it('fails with proper message when failing to get stories', async () => {
    const promise = presult(
      sh(
        `node ./bin/eyes-storybook -f ${path.resolve(
          __dirname,
          'fail-config/applitools.config.js',
        )}`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
      ),
    );
    const results = await Promise.race([promise, psetTimeout(3000).then(() => 'not ok')]);

    expect(results).not.to.equal('not ok');

    expect(results[0].stdout).to.equal(`Using @applitools/eyes-storybook version ${version}.


`);

    expect(results[0].stderr).to.equal(`- Reading stories
✖ Error when reading stories: could not determine storybook version in order to extract stories
`);
  });

  it('fails with proper message when failing to get stories because of timeout', async () => {
    const promise = presult(
      sh(
        `node ./bin/eyes-storybook -f ${path.resolve(
          __dirname,
          'fail-config/applitools.config.js',
        )} --read-stories-timeout=10 -u http://localhost:9001`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
      ),
    );
    const results = await Promise.race([promise, psetTimeout(3000).then(() => 'not ok')]);

    expect(results).not.to.equal('not ok');

    expect(results[0].stdout).to.equal(`Using @applitools/eyes-storybook version ${version}.


`);

    expect(results[0].stderr).to.equal(`- Reading stories
✖ Error when reading stories: storybook is loading for too long
`);
  });
});
