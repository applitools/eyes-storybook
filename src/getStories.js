/* global document */

function getStories() {
  if (getAllMenuItems().length !== 0) {
    console.log('getting stories from storybook. V3');
    return getStoriesV3();
  } else if (getSidebarFolders().length !== 0) {
    console.log('getting stories from storybook. V5');
    return getStoriesV5();
  } else {
    console.log('getting stories from storybook. V2');
    return getStoriesV2();
  }

  function getStoriesV2() {
    let categories = getCategories();
    console.log(`got ${categories.length} categories`);
    let stories = [];

    for (const anchor of categories) {
      verifyOpen(anchor);
      const kind = anchor.textContent;
      const storyEls = Array.from(
        anchor.nextElementSibling.querySelectorAll('a')
      );
      console.log('found', storyEls.length, 'stories for category', kind);
      stories = stories.concat(
        storyEls.map(storyEl => ({
          kind,
          name: storyEl.textContent
        }))
      );
    }

    console.log(
      stories.map(
        ({ kind, name }, i) => `${i + 1}) story kind=${kind}, name=${name}`
      )
    );

    return stories;

    function getCategories() {
      return Array.from(
        document.querySelector('.Pane.vertical.Pane1 ul').children
      ).map(li => li.querySelector('a'));
    }

    function verifyOpen(anchor) {
      if (!anchor.nextElementSibling) {
        anchor.click();
      }
    }
  }

  function getStoriesV3() {
    let menuItems = getAllMenuItems();
    console.log(`got ${menuItems.length} menu items`);

    let closedMenuItems = getClosedMenus(menuItems);
    console.log(
      `got ${closedMenuItems.length} closed menu items:\n${menuItemsToString(
        closedMenuItems
      )}`
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
        } closed menu items:\n${menuItemsToString(closedMenuItems)}`
      );
    }

    const anchors = Array.from(
      document.querySelectorAll(
        '.Pane.vertical.Pane1 [role="menuitem"] + * a[href]'
      )
    );
    console.log(`returning ${anchors.length} stories.`);
    
    return anchors.map((anchor, i) => {
      const url = new URL(anchor.href);
      const kind = url.searchParams.get('selectedKind');
      const name = url.searchParams.get('selectedStory');
      console.log(`${i + 1}) story kind=${kind}, name=${name}`);
      return {
        kind,
        name
      };
    });

    function getClosedMenus(menuItems) {
      return menuItems.filter(
        menuItem =>
          !menuItem.nextElementSibling ||
          !menuItem.nextElementSibling.children[0]
      );
    }

    function openMenus(menuItems) {
      menuItems.forEach(menuItem => menuItem.click());
    }

    function menuItemsToString(menuItems) {
      return menuItems.map(item => item.textContent).join('\n');
    }
  }

  function getStoriesV5() {
    let menuItems = getSidebarFolders();
    console.log(`got ${menuItems.length} menu items`);

    let closedMenuItems = getClosedMenus(menuItems);
    console.log(
      `got ${closedMenuItems.length} closed menu items:\n${menuItemsToString(
        closedMenuItems
      )}`
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
        } closed menu items:\n${menuItemsToString(closedMenuItems)}`
      );
    }

    const anchors = Array.from(
      document.querySelectorAll('[id^=explorer][id*=--]')
    );
    console.log(`returning ${anchors.length} stories.`);
    return anchors.map((anchor, i) => {
      const url = new URL(anchor.href);
      const kind = anchor.id.match(/explorer(\S+)--\S+/)[1];
      const name = anchor.id.match(/explorer\S+--(\S+)/)[1];
      console.log(`${i + 1}) story kind=${kind}, name=${name}`);
      return {
        kind,
        name
      };
    });

    function getClosedMenus(menuItems) {
      return menuItems.filter(
        menuItem =>
          !menuItem.nextElementSibling || menuItem.nextElementSibling.id
      );
    }

    function openMenus(menuItems) {
      menuItems.forEach(menuItem => menuItem.click());
    }

    function menuItemsToString(menuItems) {
      return menuItems.map(item => item.textContent).join('\n');
    }
  }

  function getAllMenuItems() {
    return Array.from(
      document.querySelectorAll('.Pane.vertical.Pane1 [role="menuitem"]')
    );
  }

  function getSidebarFolders() {
    return Array.from(
      document.querySelectorAll('[id^=explorer]:not([id*=--])')
    );
  }
}

module.exports = getStories;
