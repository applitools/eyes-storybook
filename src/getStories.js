/* global window,document */

async function getStories() {
  const Stories = {
    _getStoriesV2: () => {
      let categories = getCategories();
      console.log(`got ${categories.length} categories`);
      let stories = [];

      for (const anchor of categories) {
        verifyOpen(anchor);
        const kind = anchor.textContent;
        const storyEls = Array.from(anchor.nextElementSibling.querySelectorAll('a'));
        console.log('found', storyEls.length, 'stories for category', kind);
        stories = stories.concat(
          storyEls.map(storyEl => ({
            kind,
            name: storyEl.textContent,
          })),
        );
      }

      console.log(stories.map(({kind, name}, i) => `${i + 1}) story kind=${kind}, name=${name}`));

      return stories;

      function getCategories() {
        return Array.from(document.querySelector('.Pane.vertical.Pane1 ul').children).map(li =>
          li.querySelector('a'),
        );
      }

      function verifyOpen(anchor) {
        if (!anchor.nextElementSibling) {
          anchor.click();
        }
      }
    },

    _getStoriesV3: () => {
      let menuItems = getAllMenuItems();
      console.log(`got ${menuItems.length} menu items`);

      let closedMenuItems = getClosedMenus(menuItems);
      console.log(
        `got ${closedMenuItems.length} closed menu items:\n${menuItemsToString(closedMenuItems)}`,
      );

      while (closedMenuItems.length) {
        console.log(`opening ${closedMenuItems.length} closed menu items`);
        openMenus(closedMenuItems);
        menuItems = getAllMenuItems();
        closedMenuItems = getClosedMenus(menuItems);
        console.log(`after opening menus, got ${menuItems.length} menu items`);
        console.log(
          `after opening menus, got ${
            closedMenuItems.length
          } closed menu items:\n${menuItemsToString(closedMenuItems)}`,
        );
      }

      const anchors = Array.from(
        document.querySelectorAll('.Pane.vertical.Pane1 [role="menuitem"] + * a[href]'),
      );
      console.log(`returning ${anchors.length} stories.`);

      return anchors.map((anchor, i) => {
        const url = new URL(anchor.href);
        const kind = url.searchParams.get('selectedKind');
        const name = url.searchParams.get('selectedStory');
        console.log(`${i + 1}) story kind=${kind}, name=${name}`);
        return {
          kind,
          name,
        };
      });

      function getClosedMenus(menuItems) {
        return menuItems.filter(
          menuItem => !menuItem.nextElementSibling || !menuItem.nextElementSibling.children[0],
        );
      }

      function openMenus(menuItems) {
        menuItems.forEach(menuItem => menuItem.click());
      }

      function menuItemsToString(menuItems) {
        return menuItems.map(item => item.textContent).join('\n');
      }
    },
  };

  const clientApi = await waitForClientAPI();

  if (clientApi) {
    return getStoriesThroughClientAPI(clientApi);
  } else if (isStoryBookLoading()) {
    throw new Error('storybook is loading for too long');
  } else {
    const storybookVersion = getVersion();
    console.log(`getting stories from storybook through scraping. ${storybookVersion}`);
    return Stories[`_getStories${storybookVersion}`]();
  }

  function getStoriesThroughClientAPI(clientApi) {
    return clientApi.raw().map(({name, kind, parameters}) => {
      let parametersIfSerialized, error;
      try {
        parametersIfSerialized = JSON.parse(JSON.stringify(parameters));
      } catch (e) {
        error = `Ignoring parameters for story: "${name} ${kind}" ! since they are not serilizable, error: "${e.message}"`;
      }

      return {
        name,
        kind,
        parameters: parametersIfSerialized,
        error,
      };
    });
  }

  function getAllMenuItems() {
    return Array.from(document.querySelectorAll('.Pane.vertical.Pane1 [role="menuitem"]'));
  }

  function getVersion() {
    if (getAllMenuItems().length !== 0) {
      return 'V3';
    } else {
      return 'V2';
    }
  }

  function getClientAPI() {
    const frameWindow = getFrameWindow();
    if (
      frameWindow &&
      frameWindow.__STORYBOOK_CLIENT_API__ &&
      frameWindow.__STORYBOOK_CLIENT_API__.raw
    ) {
      return frameWindow.__STORYBOOK_CLIENT_API__;
    }
  }

  function getFrameWindow() {
    return Array.prototype.filter.call(window.frames, frame => {
      try {
        return /\/iframe.html/.test(frame.location.href);
      } catch (e) {}
    })[0];
  }

  function isStoryBookLoading() {
    return Array.from(document.querySelectorAll('nav.container span')).some(
      s => s.innerText === 'loading story',
    );
  }

  function waitForClientAPI() {
    const WAIT_FOR_SB_TIMEOUT = 10000;

    const _waitForClientAPI = async () => {
      const clientApi = getClientAPI();
      if (clientApi) {
        return clientApi;
      } else {
        await delay(100);
        return _waitForClientAPI();
      }
    };

    return ptimeoutWithValue(_waitForClientAPI, WAIT_FOR_SB_TIMEOUT, undefined);
  }

  async function delay(time) {
    return new Promise(res => {
      setTimeout(res, time);
    });
  }

  async function ptimeoutWithValue(getPromise, delay, value) {
    let _res, _rej;
    const result = new Promise((res, rej) => ((_res = res), (_rej = rej)));
    const cancel = setTimeout(() => _res(value), delay);
    getPromise()
      .then(v => _res(v))
      .catch(e => _rej(e))
      .finally(() => clearTimeout(cancel));
    return result;
  }
}

module.exports = getStories;
