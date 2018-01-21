import Rx from 'rxjs/Rx';
import { join, basename } from 'path';
import { app, Menu, MenuItem } from 'electron';
import { launch } from './launch';
import { readFileObservable, writeFileObservable } from '../utils/fs';
import { writeFileSync } from 'fs';
import { getMenu } from './menu';

let recents = [];

const max_items = 6;

export function rebuildRecentMenu() {
  const menu = getMenu();
  if (!menu) {
    return;
  }
  const file_index = process.platform === 'darwin' ? 1 : 0;
  const openRecent = menu[file_index].submenu[2];
  if (!openRecent) {
    return;
  }

  openRecent.submenu = [];
  for(const item of recents.slice().reverse()) {
    openRecent.submenu.push(new MenuItem({
      label: basename(item),
      click: launch.bind(null, item),
    }));
  }

  if (recents.length > 0) {
    // sep
    openRecent.submenu.push(new MenuItem({
      type: 'separator',
    }));
    // add clear button
    openRecent.submenu.push(new MenuItem({
      label: 'Clear',
      click: clearRecentDocuments,
    }));
    openRecent.enabled = true;
  } else {
    openRecent.enabled = false;
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
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
  const filepath = join(app.getPath('userData'),'recents.json');
  return readFileObservable(filepath)
    .map((data) => {
      recents = JSON.parse(data);
      rebuildRecentMenu();
    })
    .catch((err) => {
      return Rx.Observable.Empty();
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