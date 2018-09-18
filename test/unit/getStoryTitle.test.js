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
});
