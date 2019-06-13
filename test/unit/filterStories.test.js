'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const filterStories = require('../../src/filterStories');

describe('filterStories', () => {
  it('filters by REGEX in global config', () => {
    const stories = [{name: 'aaa', bla: 'kuku'}, {name: 'bbb'}];
    const config = {filterStories: /^a/};
    expect(filterStories({stories, config})).to.eql([{name: 'aaa', bla: 'kuku'}]);
  });

  it('filters by string in global config', () => {
    const stories = [{name: 'aaa', bla: 'kuku'}, {name: 'bbb'}];
    const config = {filterStories: '^a'};
    expect(filterStories({stories, config})).to.eql([{name: 'aaa', bla: 'kuku'}]);
  });

  it('filters by function in global config', () => {
    const stories = [{name: 'aaa', bla: 'kuku'}, {name: 'bbb'}];
    const config = {filterStories: ({bla}) => bla === 'kuku'};
    expect(filterStories({stories, config})).to.eql([{name: 'aaa', bla: 'kuku'}]);
  });

  it('fails when global config has invalid filter', () => {
    const stories = [{name: 'aaa', bla: 'kuku'}, {name: 'bbb'}];
    const config = {filterStories: '['};
    expect(() => filterStories({stories, config})).to.throw(
      SyntaxError,
      `Eyes storybook configuration has an invalid value for 'filterStories' - it cannot be interpreted as a regular expression. This is probably an issue in 'applitools.config.js' file. Original error is: `,
    );
  });

  it('filters by local parameter', () => {
    const stories = [{name: 'aaa', bla: 'kuku'}, {name: 'bbb', parameters: {eyes: {skip: true}}}];
    expect(filterStories({stories, config: {}})).to.eql([{name: 'aaa', bla: 'kuku'}]);
  });

  it('filters with precedence of local over global', () => {
    const stories = [{name: 'aaa', bla: 'kuku'}, {name: 'bbb', parameters: {eyes: {skip: false}}}];
    const config = {filterStories: /^a/};
    expect(filterStories({stories, config})).to.eql(stories);
  });

  it("doesn't fail when parameters are missing the 'eyes' property", () => {
    const stories = [{name: 'bbb', bla: 'kuku', parameters: {}}];
    const config = {filterStories: /^a/};
    expect(filterStories({stories, config})).to.eql([]);
  });
});
