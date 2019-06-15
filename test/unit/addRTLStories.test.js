'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const addRTLStories = require('../../src/addRTLStories');

describe('addRTLStories', () => {
  it('adds stories by REGEX in global config', () => {
    const stories = [{name: 'aaa', kind: 'kuku'}, {name: 'bbb'}];
    const config = {rtlRegex: /^a/};
    expect(addRTLStories({stories, config})).to.eql([
      {name: 'aaa', kind: 'kuku'},
      {name: 'bbb'},
      {name: 'aaa', kind: 'kuku', parameters: {eyes: {shouldAddRTL: true}}},
    ]);
  });

  it('adds stories by REGEX in global config with existing parameters', () => {
    const stories = [{name: 'aaa', kind: 'kuku', parameters: {}}, {name: 'bbb'}];
    const config = {rtlRegex: /^a/};
    expect(addRTLStories({stories, config})).to.eql([
      {name: 'aaa', kind: 'kuku', parameters: {}},
      {name: 'bbb'},
      {name: 'aaa', kind: 'kuku', parameters: {eyes: {shouldAddRTL: true}}},
    ]);
  });

  it('adds stories by REGEX in global config with existing parameters that have eyes property', () => {
    const stories = [{name: 'aaa', kind: 'kuku', parameters: {eyes: {bla: 'bla'}}}, {name: 'bbb'}];
    const config = {rtlRegex: /^a/};
    expect(addRTLStories({stories, config})).to.eql([
      {name: 'aaa', kind: 'kuku', parameters: {eyes: {bla: 'bla'}}},
      {name: 'bbb'},
      {name: 'aaa', kind: 'kuku', parameters: {eyes: {bla: 'bla', shouldAddRTL: true}}},
    ]);
  });

  it('filters by string in global config', () => {
    const stories = [{name: 'aaa', kind: 'kuku'}, {name: 'bbb'}];
    const config = {rtlRegex: '^a'};
    expect(addRTLStories({stories, config})).to.eql([
      {name: 'aaa', kind: 'kuku'},
      {name: 'bbb'},
      {name: 'aaa', kind: 'kuku', parameters: {eyes: {shouldAddRTL: true}}},
    ]);
  });

  it('fails when global config has invalid filter', () => {
    const stories = [{name: 'aaa', bla: 'kuku'}, {name: 'bbb'}];
    const config = {rtlRegex: '['};
    expect(() => addRTLStories({stories, config})).to.throw(
      SyntaxError,
      `Eyes storybook configuration has an invalid value for 'filterStories' - it cannot be interpreted as a regular expression. This is probably an issue in 'applitools.config.js' file. Original error is: `,
    );
  });

  it('filters by local parameter', () => {
    const stories = [
      {name: 'aaa', bla: 'kuku'},
      {name: 'bbb', kind: 'kuku', parameters: {eyes: {rtl: true}}},
    ];
    expect(addRTLStories({stories, config: {}})).to.eql([
      {name: 'aaa', bla: 'kuku'},
      {name: 'bbb', kind: 'kuku', parameters: {eyes: {rtl: true}}},
      {name: 'bbb', kind: 'kuku', parameters: {eyes: {rtl: true, shouldAddRTL: true}}},
    ]);
  });
});
