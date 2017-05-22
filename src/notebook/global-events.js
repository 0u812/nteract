/* @flow */

import type { Store } from 'redux';
import type { AppState } from './records';
import { ipcRenderer } from 'electron';
import { getVCardWindow } from './vcard';

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
}

// drag/drop

document.ondragover = document.ondrop = (ev) => {
  ev.preventDefault()
}

document.body.ondrop = (ev) => {
  console.log(ev.dataTransfer.files[0].path)
  ev.preventDefault()
}
