'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const getStoryUrl = require('../../src/getStoryUrl');

describe('getStoryUrl', () => {
  it('encodes URI properly', () => {
    const name = 'name='; // = ==> %3D
    const kind = 'kind+'; // + ==> %2B
    const baseUrl = 'http://some/url';
    const expected =
      'http://some/url/iframe.html?eyes-storybook=true&selectedKind=kind%2B&selectedStory=name%3D';
    expect(getStoryUrl({name, kind}, baseUrl)).to.equal(expected);
  });

  it('adds RTL param when needed', () => {
    const name = 'name';
    const kind = 'kind';
    const baseUrl = 'http://some/url/';
    const parameters = {eyes: {variationUrlParam: 'bla'}};
    const expected =
      'http://some/url/iframe.html?eyes-storybook=true&selectedKind=kind&selectedStory=name&eyes-variation=bla';
    expect(getStoryUrl({name, kind, parameters}, baseUrl)).to.equal(expected);
  });
});
