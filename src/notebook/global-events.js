/* @flow */

import type { Store } from 'redux';
import type { AppState } from './records';
import { ipcRenderer } from 'electron';
import { getVCardWindow } from './vcard';
import { extname } from 'path';
import { importFileIntoNotebook } from './actions';

import {
  forceShutdownKernel,
} from './kernel/shutdown';

export function unload(store: Store<AppState, Action>) {
  const state = store.getState();
  const kernel = {
    channels: state.app.channels,
    spawn: state.app.spawn,
    connectionFile: state.app.connectionFile,
  };
  forceShutdownKernel(kernel);
}

export function initGlobalHandlers(store: Store<AppState, Action>) {
  global.window.onunload = unload.bind(null, store);
  // via org.analogmachine.tellurium protocol
  ipcRenderer.on('update-personal-info', (e, keys) => {
    const vcard = getVCardWindow();
    if (vcard) {
      vcard.webContents.send('update-personal-info', keys);
    }
  });

  // https://gist.github.com/armaldio/75ae2b6476da83110cf8d54d47e89b56

  document.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      for (let f of e.dataTransfer.files) {
          console.log('File(s) you dragged here: ', f.path)
          const ext = extname(f.path);
          console.log('file has extension: ', ext);
          if (ext === '.omex') {
            store.dispatch(importFileIntoNotebook('', f.path, '', 'omex', 'below'));
          }
      }
      return false;
  });

  document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
  });
}

// drag/drop

// document.ondragover = (ev) => {
//   // console.log('document.ondragover');
//   // console.log(ev.dataTransfer.files[0].path);
//   ev.preventDefault();
//   return false;
// }
//
// document.body.ondrop = (ev) => {
//   console.log('document.body.ondrop ', ev.dataTransfer.files[0].path);
//   ev.preventDefault();
// }
//
// document.ondrop = (ev) => {
//   // console.log('document.ondrop');
//   // console.log(ev.dataTransfer.files[0].path);
//   ev.preventDefault();
// }
