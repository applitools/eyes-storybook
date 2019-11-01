'use strict';

function createPagePool({logger, numOfPages, initPage}) {
  let counter = 0;
  const fullPageObjs = [];
  logger.log(`[page pool] ${numOfPages} pages open`);
  let currWaitOnFreePage = Promise.resolve();
  return {
    getFreePage,
    createPage: async () => {
      const fullPageObj = await createPage();
      fullPageObjs.push(fullPageObj);
      return toSmallPageObj(fullPageObj);
    },
    addToPool: pageId => {
      const fullPageObj = fullPageObjs.find(p => p.pageId === pageId);
      fullPageObj.addToPool();
    },
    removePage: pageId => {
      const fullPageObj = fullPageObjs.find(p => p.pageId === pageId);
      fullPageObj.removePage();
    },
  };

  async function getFreePage() {
    logger.log(`[page pool] waiting for free page`);
    await currWaitOnFreePage;
    currWaitOnFreePage = Promise.race(
      fullPageObjs
        .filter(p => p.isInPool())
        .map(async p => {
          await p.waitUntilFree();
          return p;
        }),
    );
    const fullPageObj = await currWaitOnFreePage;
    fullPageObj.occupyPage();
    logger.log(`[page pool] free page found: ${fullPageObj.pageId}`);
    return toSmallPageObj(fullPageObj);
  }

  async function createPage() {
    const pageId = counter++;
    let workPromise = Promise.resolve();
    let resolveWork;
    let isActive;
    const page = await initPage(pageId);
    const createdAt = Date.now();
    return {
      page,
      pageId,
      markPageAsFree,
      waitUntilFree,
      occupyPage,
      removePage,
      createdAt,
      isInPool,
      addToPool,
    };

    function markPageAsFree() {
      resolveWork();
    }

    async function waitUntilFree() {
      await workPromise;
    }

    function occupyPage() {
      workPromise = new Promise(resolve => {
        resolveWork = resolve;
      });
    }

    function removePage() {
      fullPageObjs.splice(fullPageObjs.findIndex(p => p.pageId === pageId), 1);
    }

    function isInPool() {
      return isActive;
    }

    function addToPool() {
      isActive = true;
    }
  }

  function toSmallPageObj({page, pageId, markPageAsFree, removePage, createdAt}) {
    return {page, pageId, markPageAsFree, removePage, createdAt};
  }
}

module.exports = createPagePool;
