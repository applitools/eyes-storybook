/* global document */
function getStories() {
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
      `after opening menus, got ${closedMenuItems.length} closed menu items:\n${menuItemsToString(
        closedMenuItems,
      )}`,
    );
  }

  const anchors = Array.from(
    document.querySelectorAll('.Pane.vertical.Pane1 [role="menuitem"] + * a[href]'),
  );
  console.log(`returning ${anchors.length} stories.`);
  return anchors.map((anchor, i) => {
    const url = new URL(anchor.href);
    const kind = decodeURIComponent(url.searchParams.get('selectedKind'));
    const name = decodeURIComponent(url.searchParams.get('selectedStory'));
    console.log(`${i + 1}) story kind=${kind}, name=${name}`);
    return {
      kind,
      name,
    };
  });

  function getAllMenuItems() {
    return Array.from(document.querySelectorAll('.Pane.vertical.Pane1 [role="menuitem"]'));
  }

  function getClosedMenus(menuItems) {
    return menuItems.filter(menuItem => !menuItem.nextElementSibling.children[0]);
  }

  function openMenus(menuItems) {
    menuItems.forEach(menuItem => menuItem.click());
  }

  function menuItemsToString(menuItems) {
    return menuItems.map(item => item.textContent).join('\n');
  }
}

module.exports = getStories;
