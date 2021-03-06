const {dialog, BrowserWindow, app} = require('electron').remote;
import { writeFileSync } from 'fs';
const path = require('path');
import username from 'username';
import { existsSync } from 'fs';

let globalVCardWindow;

export function getTelluriumDir() {
  return path.join(app.getPath('userData'), 'telocal');
}

export function getVCardPath() {
  return path.join(getTelluriumDir(),username.sync()+'.vcard');
}

export function checkVCardExists(): Boolean {
  return existsSync(getVCardPath());
}

export function writeDummyVCard(): void {
  writeFileSync(getVCardPath(), JSON.stringify({
    version: '1.0.0',
    first_name: username.sync(),
    last_name: '',
    email: username.sync()+'@dankmemes.com',
    organization: '',
    orcid: ''
  }));
}

export function openVCardWindow() {
  var vcard_dialog = new BrowserWindow({width: 740, height: 440, useContentSize: true, title: 'VCard Info', show: false});
  const vcard_page = path.join(app.getAppPath(), 'static', 'vcard.html');
  vcard_dialog.loadURL('file://'+vcard_page);
  vcard_dialog.once('ready-to-show', () => {
    vcard_dialog.show();
  });
  globalVCardWindow = vcard_dialog;
  return vcard_dialog;
}

export function getVCardWindow() {
  return globalVCardWindow;
}

export function vcardChecks(store: Object, id: String, cell: Object): Boolean {
  if (!checkVCardExists()) {
    const response = dialog.showMessageBox({
      type: 'question',
      title: 'VCard Not Found',
      buttons: ['Yes', 'No'],
      // TODO: Upgrade Electron
      // checkboxLabel: 'Do not show again',
      // checkboxChecked: false,
      message: 'Would you like to fill in your personal info now?',
      detail:  'Could not find you personal info. '+
      'Would you like to fill in your personal info now? '+
      'This will automatically add your name to any COMBINE archives you create.'
    }//,
    // callback
    // (response, checkboxChecked) => {
    // (response) => {
    //   alert(response);
    //   if (response === 0) {
    //     alert('yes');
    //   }
    // }}
    );
    if (response === 0) {
      // Create the VCard and do not execute the cell
      openVCardWindow();
      return false;
    } else {
      // Create a dummy VCard and execute the cell
      writeDummyVCard();
    }
  }
  return true;
}
