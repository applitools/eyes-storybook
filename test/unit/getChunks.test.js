'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const getChunks = require('../../src/getChunks');

describe('getChunks', () => {
  it('works when no remainder', () => {
    expect(getChunks([1, 2, 3, 4, 5, 6], 3)).to.eql([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it('works with remainder', () => {
    expect(getChunks([1, 2, 3, 4, 5], 3)).to.eql([[1, 2], [3, 4], [5]]);
    expect(getChunks([1, 2, 3, 4, 5, 6, 7], 3)).to.eql([
      [1, 2, 3],
      [4, 5],
      [6, 7],
    ]);
  });
});
