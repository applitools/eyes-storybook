'use strict';

const {describe, it} = require('mocha');
const {expect} = require('chai');
const createPagePool = require('../../src/pagePool');
const {delay} = require('@applitools/functional-commons');
const logger = require('../util/testLogger');

// TODO (amit): unskip
describe.skip('page pool', () => {
  it('starts with "x" free pages', async () => {
    const initPage = async index => index;
    const {getFreePage} = await createPagePool({logger, numOfPages: 3, initPage});
    const p1 = await getFreePage();
    expect(p1.page).to.equal(0);
    expect(p1.pageId).to.equal(0);
    const p2 = await getFreePage();
    expect(p2.page).to.equal(1);
    expect(p2.pageId).to.equal(1);
    const p3 = await getFreePage();
    expect(p3.page).to.equal(2);
    expect(p3.pageId).to.equal(2);
  });

  it("doesn't provide a page if pool is full", async () => {
    const initPage = async index => index;
    const {getFreePage} = await createPagePool({logger, numOfPages: 1, initPage});
    const {markPageAsFree} = await getFreePage();
    delay(100).then(markPageAsFree);
    const nonPage = await Promise.race([delay(50).then(() => 'ok'), getFreePage()]);
    expect(nonPage).to.equal('ok');
  });

  it('returns free pages in FIFO order', async () => {
    const initPage = async index => index;
    const {getFreePage} = await createPagePool({logger, numOfPages: 2, initPage});
    const p1 = await getFreePage();
    expect(p1.pageId).to.equal(0);
    const p2 = await getFreePage();
    expect(p2.pageId).to.equal(1);
    const p3Promise = getFreePage();
    await delay(0);
    const p4Promise = getFreePage();
    p1.markPageAsFree();
    p2.markPageAsFree();
    expect((await p3Promise).pageId).to.equal(0);
    expect((await p4Promise).pageId).to.equal(1);
  });

  it('can create pages', async () => {});

  it('can remove pages', async () => {});
});
