'use strict';

async function createPagePool({logger, numOfPages, initPage}) {
  let counter = 0;
  const fullPageObjs = await Promise.all(new Array(numOfPages).fill().map(createPage));
  logger.log(`[page pool] ${numOfPages} pages open`);
  return {
    getFreePage,
    createPage: async () => {
      const fullPageObj = await createPage();
      fullPageObjs.push(fullPageObj);
      return toSmallPageObj(fullPageObj);
    },
  };

  async function getFreePage() {
    logger.log(`[page pool] waiting for free page`);
    const fullPageObj = await Promise.race(fullPageObjs.map(p => p.waitUntilFree()));
    logger.log(`[page pool] free page found: ${fullPageObj.pageId}`);
    fullPageObj.occupyPage();
    return toSmallPageObj(fullPageObj);
  }

  async function createPage() {
    const pageId = counter++;
    let workPromise = Promise.resolve();
    let resolveWork;

    const page = await initPage(pageId);
    const pageObj = {page, pageId, markPageAsFree, waitUntilFree, occupyPage};
    return pageObj;

    function markPageAsFree() {
      resolveWork();
    }

    async function waitUntilFree() {
      await workPromise;
      return pageObj;
    }

    function occupyPage() {
      workPromise = new Promise(resolve => {
        resolveWork = resolve;
      });
    }
  }

  function toSmallPageObj({page, pageId, markPageAsFree}) {
    return {page, pageId, markPageAsFree};
  }
}

module.exports = createPagePool;
