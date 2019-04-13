/* global document */

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

    _getStoriesV5: () => {
      let menuItems = getSidebarFolders();
      console.log(`got ${menuItems.length} menu items`);

      let closedMenuItems = getClosedMenus(menuItems);
      console.log(
        `got ${closedMenuItems.length} closed menu items:\n${menuItemsToString(closedMenuItems)}`,
      );

      while (closedMenuItems.length) {
        console.log(`opening ${closedMenuItems.length} closed menu items`);
        openMenus(closedMenuItems);
        menuItems = getSidebarFolders();
        closedMenuItems = getClosedMenus(menuItems);
        console.log(`after opening menus, got ${menuItems.length} menu items`);
        console.log(
          `after opening menus, got ${
            closedMenuItems.length
          } closed menu items:\n${menuItemsToString(closedMenuItems)}`,
        );
      }

      const stories = getStoriesFromAnchors(document.querySelectorAll('section > a[id*=explore]'));
      console.log(`returning ${stories.length} stories.`);
      return stories;

      function getStoriesFromAnchors(anchors) {
        return Array.from(anchors).reduce((acc, anchor) => {
          let stories;

          if (isLeafAnchor(anchor)) {
            const [, kind, name] = anchor.id.match(/explorer(\S+)--(\S+)/);
            stories = [{kind, name}];
          } else {
            stories = getStoriesFromAnchor(anchor);
          }

          acc = acc.concat(stories);
          return acc;
        }, []);

        function isLeafAnchor(anchor) {
          return !anchor.nextElementSibling || anchor.nextElementSibling.tagName !== 'DIV';
        }

        function getStoriesFromAnchor(anchor, kind) {
          const childAnchors =
            anchor.nextElementSibling &&
            anchor.nextElementSibling.querySelectorAll(':scope > a[id*=explore]');
          return getStoriesFromAnchors(childAnchors || [], kind);
        }
      }

      function getClosedMenus(menuItems) {
        return menuItems.filter(
          menuItem => !menuItem.nextElementSibling || menuItem.nextElementSibling.id,
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

  await waitForStorybook();
  console.log(`getting stories from storybook. ${getVersion()}`);
  return Stories[`_getStories${getVersion()}`]();

  function getAllMenuItems() {
    return Array.from(document.querySelectorAll('.Pane.vertical.Pane1 [role="menuitem"]'));
  }

  function getSidebarFolders() {
    return Array.from(document.querySelectorAll('[id^=explorer]:not([id*=--])'));
  }

  function getVersion() {
    if (getAllMenuItems().length !== 0) {
      return 'V3';
    } else if (getSidebarFolders().length !== 0) {
      return 'V5';
    } else {
      return 'V2';
    }
  }

  function isStoryBookLoading() {
    return Array.from(document.querySelectorAll('nav.container span')).some(
      s => s.innerText === 'loading story',
    );
  }

  async function waitForStorybook() {
    const WAIT_FOR_SB_TIMEOUT = 10000;

    const _waitForStorybook = async () => {
      const isLoading = isStoryBookLoading();
      if (isLoading) {
        await delay(200);
        await _waitForStorybook();
      }
    };
    await ptimeoutWithError(
      _waitForStorybook,
      WAIT_FOR_SB_TIMEOUT,
      'storybook is loading for too long',
    );
  }

  async function delay(time) {
    return new Promise(res => {
      setTimeout(res, time);
    });
  }

  async function ptimeoutWithError(getPromise, delay, err) {
    let _res, _rej;
    const result = new Promise((res, rej) => ((_res = res), (_rej = rej)));
    const cancel = setTimeout(() => _rej(err), delay);
    getPromise()
      .then(v => _res(v))
      .catch(e => _rej(e))
      .finally(() => clearTimeout(cancel));
    return result;
  }
}

module.exports = getStories;
