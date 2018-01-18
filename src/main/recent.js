import { join, basename } from 'path';
import { app, Menu, MenuItem } from 'electron';
import { launch } from './launch';
import { readFileObservable, writeFileObservable } from '../utils/fs';
import { writeFileSync } from 'fs';

let recents = [];

const max_items = 6;

export function rebuildRecentMenu() {
  const menu = Menu.getApplicationMenu();
  const openRecent = menu.items[0].submenu.items[2];
  if (!openRecent) {
    return;
  }

  openRecent.submenu.clear();
  for(const item of recents.slice().reverse()) {
    openRecent.submenu.append(new MenuItem({
      label: basename(item),
      click: launch.bind(null, item),
    }));
  }

  if (recents.length > 0) {
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
    return;
  }

  // remove duplicates
  const index = recents.findIndex(x => x == filename);
  if (index != -1) {
    recents.splice(index,1);
  }

  // add to recents list
  recents.push(filename);

  const overflow = recents.length - max_items;
  if (overflow > 0) {
    recents.splice(0,overflow);
  }
  rebuildRecentMenu();
}

export function readRecentDocumentsObservable() {
  console.log('readRecentDocumentsObservable');
  const filepath = join(app.getPath('userData'),'recents.json');
  return readFileObservable(filepath)
    .catch((err) => {})
    .map((data) => {
      recents = JSON.parse(data);
      console.log('set recents ', recents);
      rebuildRecentMenu();
    });
}

export function clearRecentDocuments() {
  recents = [];
  rebuildRecentMenu();
}

export function writeRecentDocumentsObservable() {
  const filepath = join(app.getPath('userData'),'recents.json');
  // TODO: use defer?
  writeFileSync(filepath, JSON.stringify(recents));
  return writeFileObservable(filepath, JSON.stringify(recents));
}