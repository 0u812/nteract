import { basename } from 'path';
import { Menu, MenuItem } from 'electron';
import { launch } from './launch';

let recent = [];

const max_items = 6;

export function rebuildRecentMenu() {
  const menu = Menu.getApplicationMenu();
  const openRecent = menu.items[0].submenu.items[2];
  if (!openRecent) {
    return;
  }

  openRecent.submenu.clear();
  for(const item of recent) {
    openRecent.submenu.append(new MenuItem({
      label: basename(item),
      click: launch.bind(null, item),
    }));
  }

  if (recent.length > 0) {
    // sep
    openRecent.submenu.append(new MenuItem({
      type: 'separator',
    }));
    // add clear button
    openRecent.submenu.append(new MenuItem({
      label: 'Clear',
      click: clearRecentDocuments,
    }));
    openRecent.enabled = true;
  } else {
    openRecent.enabled = false;
  }
  Menu.setApplicationMenu(menu);
}

export function addToRecentDocuments(filename) {
  if (!filename) {
    console.log("add to recent return");
    return;
  }

  // remove duplicates
  const index = recent.findIndex(x => x == filename);
  if (index != -1) {
    recent.splice(index,1);
  }

  // add to recent list
  recent.push(filename);

  const overflow = recent.length - max_items;
  if (overflow > 0) {
    recent.splice(0,overflow);
  }
  rebuildRecentMenu();
}

export function clearRecentDocuments() {
  recent = [];
  rebuildRecentMenu();
}