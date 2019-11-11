'use strict';

const {describe, it} = require('mocha');
const {expect} = require('chai');
const path = require('path');
const fs = require('fs');
const {presult} = require('@applitools/functional-commons');
const validateAndPopulateConfig = require('../../src/validateAndPopulateConfig');
const {
  missingApiKeyFailMsg,
  missingAppNameAndPackageJsonFailMsg,
  missingAppNameInPackageJsonFailMsg,
} = require('../../src/errMessages');

describe('validateAndPopulateConfig', () => {
  it('throws error on missing apiKey', async () => {
    const [err] = await presult(validateAndPopulateConfig({config: {}}));
    expect(err).to.be.an.instanceOf(Error);
    expect(err.message).to.equal(missingApiKeyFailMsg);
  });

  it("throws error on missing appName when there's no package.json", async () => {
    const [err] = await presult(validateAndPopulateConfig({config: {apiKey: 'bla'}}));
    expect(err).to.be.an.instanceOf(Error);
    expect(err.message).to.equal(missingAppNameAndPackageJsonFailMsg);
  });

  it('throws error on missing appName when there is a package.json file but no name', async () => {
    const packageJsonWithoutAppNamePath = path.resolve(
      __dirname,
      '../fixtures/packageJsonWithoutAppName',
    );
    const [err] = await presult(
      validateAndPopulateConfig({
        config: {apiKey: 'bla'},
        packagePath: packageJsonWithoutAppNamePath,
      }),
    );
    expect(err).to.be.an.instanceOf(Error);
    expect(err.message).to.equal(missingAppNameInPackageJsonFailMsg);
  });

  it('finds appName in package.json file', async () => {
    const packageJsonWithAppNamePath = path.resolve(
      __dirname,
      '../fixtures/packageJsonWithAppName',
    );
    const config = {apiKey: 'bla', storybookUrl: 'bla'};
    await validateAndPopulateConfig({
      config,
      logger: console,
      packagePath: packageJsonWithAppNamePath,
    });
    expect(config.appName).to.equal('bla');
  });

  it('adds agentId with proper version', async () => {
    const {version} = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json')));
    const config = {apiKey: 'bla', storybookUrl: 'url', appName: 'bla'};
    await validateAndPopulateConfig({
      config,
      logger: console,
    });
    expect(config.agentId).to.equal(`eyes-storybook/${version}`);
  });

  it('adds correct configuration for runInDocker when no puppeteerOptions is specified', async () => {
    const config = {apiKey: 'bla', storybookUrl: 'url', appName: 'bla', runInDocker: true};
    await validateAndPopulateConfig({
      config,
      logger: console,
    });
    expect(config.puppeteerOptions).to.eql({
      args: ['--disable-dev-shm-usage'],
    });
  });

  it('adds correct configuration for runInDocker when puppeteerOptions IS specified', async () => {
    const config = {
      apiKey: 'bla',
      storybookUrl: 'url',
      appName: 'bla',
      runInDocker: true,
      puppeteerOptions: {bla: true},
    };
    await validateAndPopulateConfig({
      config,
      logger: console,
    });
    expect(config.puppeteerOptions).to.eql({
      bla: true,
      args: ['--disable-dev-shm-usage'],
    });
  });

  it('adds correct configuration for runInDocker when puppeteerOptions IS specified with empty args', async () => {
    const config = {
      apiKey: 'bla',
      storybookUrl: 'url',
      appName: 'bla',
      runInDocker: true,
      puppeteerOptions: {bla: true, args: []},
    };
    await validateAndPopulateConfig({
      config,
      logger: console,
    });
    expect(config.puppeteerOptions).to.eql({
      bla: true,
      args: ['--disable-dev-shm-usage'],
    });
  });

  it('adds correct configuration for runInDocker when puppeteerOptions IS specified with args', async () => {
    const config = {
      apiKey: 'bla',
      storybookUrl: 'url',
      appName: 'bla',
      runInDocker: true,
      puppeteerOptions: {bla: true, args: ['something']},
    };
    await validateAndPopulateConfig({
      config,
      logger: console,
    });
    expect(config.puppeteerOptions).to.eql({
      bla: true,
      args: ['something', '--disable-dev-shm-usage'],
    });
  });

  it('adds correct configuration for runInDocker when puppeteerOptions IS specified with args and --disable-dev-shm-usage', async () => {
    const config = {
      apiKey: 'bla',
      storybookUrl: 'url',
      appName: 'bla',
      runInDocker: true,
      puppeteerOptions: {bla: true, args: ['something', '--disable-dev-shm-usage']},
    };
    await validateAndPopulateConfig({
      config,
      logger: console,
    });
    expect(config.puppeteerOptions).to.eql({
      bla: true,
      args: ['something', '--disable-dev-shm-usage'],
    });
  });
});
