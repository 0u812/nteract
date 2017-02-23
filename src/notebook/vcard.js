const {dialog, BrowserWindow, app} = require('electron').remote;
import { writeFileSync } from 'fs';
const path = require('path');
const os = require('os');
import username from 'username';
import { existsSync } from 'fs';

export function getTelluriumDir() {
  return (process.platform == 'win32' ? path.join(process.env.APPDATA, 'tellurium') : path.join(os.homedir(), '.tellurium'));
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
    last: '',
    email: username.sync()+'@dankmemes.com',
    organization: ''
  }));
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
      var vcard_dialog = new BrowserWindow({width: 600, height: 340, useContentSize: true, title: 'VCard Info', show: false});
      const vcard_page = path.join(app.getAppPath(), 'static', 'vcard.html');
      vcard_dialog.loadURL('file://'+vcard_page);
      vcard_dialog.once('ready-to-show', () => {
        vcard_dialog.show();
      });
      return false;
    } else {
      // Create a dummy VCard and execute the cell
      writeDummyVCard();
    }
  }
  return true;
}
