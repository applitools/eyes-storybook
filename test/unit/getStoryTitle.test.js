'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const getStoryTitle = require('../../src/getStoryTitle');

describe('getStoryTitle', () => {
  it('works', () => {
    const name = 'name';
    const kind = 'kind';
    const expected = 'kind: name';
    expect(getStoryTitle({name, kind})).to.equal(expected);
  });

  it('adds RTL when needed', () => {
    const name = 'name';
    const kind = 'kind';
    const parameters = {eyes: {shouldAddRTL: true}};
    const expected = 'kind: name [RTL]';
    expect(getStoryTitle({name, kind, parameters})).to.equal(expected);
  });
});
