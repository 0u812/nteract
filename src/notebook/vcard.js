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
