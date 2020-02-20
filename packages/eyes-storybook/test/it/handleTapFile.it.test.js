const fs = require('fs');
const {resolve} = require('path');
const {promisify} = require('util');
const {describe, it} = require('mocha');
const {expect} = require('chai');
const handleTapFile = require('../../src/handleTapFile');
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

describe('handleTapFile', () => {
  const formatter = {asHierarchicTAPString: () => 'the results'};

  it('works', async () => {
    let path;
    try {
      path = handleTapFile(__dirname, formatter);
      expect(path).to.be.equal(resolve(__dirname, 'eyes.tap'));
      const content = await readFile(resolve(__dirname, 'eyes.tap'), 'utf8');
      expect(content).to.be.equal(formatter.asHierarchicTAPString());
    } finally {
      path && (await unlink(path));
    }
  });
});
