/* global document */
function getStories() {
  let menuItems = getAllMenuItems();
  let closedMenuItems = getClosedMenus(menuItems);

  while (closedMenuItems.length) {
    openMenus(closedMenuItems);
    menuItems = getAllMenuItems();
    closedMenuItems = getClosedMenus(menuItems);
  }

  return Array.from(
    document.querySelectorAll('.Pane.vertical.Pane1 [role="menuitem"] + * a[href]'),
  ).map(anchor => {
    const url = new URL(anchor.href);
    const kind = decodeURIComponent(url.searchParams.get('selectedKind'));
    const name = decodeURIComponent(url.searchParams.get('selectedStory'));
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
}

module.exports = getStories;
