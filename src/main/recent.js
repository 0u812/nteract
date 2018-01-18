import { basename } from 'path';
import { Menu, MenuItem } from 'electron';
// import { getMenu } from './recent.js';

let recent = [];

const max = 10;

export function addToRecentDocuments(filename) {
  const menu = Menu.getApplicationMenu();
  const openRecent = menu.items[0].submenu.items[2];
  if (!openRecent) {
    console.log("could not find openRecent");
    return;
  }

  // remove duplicates
  const index = recent.findIndex(x => x == filename);
  if (index != -1) {
    recent.splice(index,1);
  }

  // add to recent list
  console.log("addToRecentDocuments ", filename);
  recent.push(filename);

  const overflow = recent.length - 10;
  if (overflow > 0) {
    recent.splice(0,overflow);
  }
  openRecent.submenu.clear();
  for(const item of recent) {
    console.log("add item ", item);
    openRecent.submenu.append(new MenuItem({
      label: basename(item),
    }));
  }
//   openRecent.submenu.append(new MenuItem({label: 'abc',}));
  openRecent.enabled = true;
  Menu.setApplicationMenu(menu);
}