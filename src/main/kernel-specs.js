import { app, ipcMain as ipc } from 'electron';
import { join } from 'path';
import { writeFile } from 'fs';
import {
  readFileObservable,
} from '../utils/fs';
import _ from 'lodash';

const KERNEL_SPECS = {
  node_nteract: {
    name: 'node_nteract',
    spec: {
      argv: [
        process.execPath,
        join(require.resolve('ijavascript'), '..', 'lib', 'kernel.js'),
        '{connection_file}',
        '--protocol=5.0',
        '--hide-undefined'
      ],
      display_name: 'Node.js (nteract)',
      language: 'javascript',
      env: {
        ELECTRON_RUN_AS_NODE: '1'
      }
    }
  },
  tepython3: {
    name: 'tepython3',
    spec: {
      language: 'python',
      display_name: 'Python 3 (built-in)',
      argv: [
        process.platform === 'win32' ?
          join(app.getPath('userData'),'telocal','python-3.6.3','python.exe') :
          join(app.getPath('userData'),'telocal','python-3.6.3','bin','python3'),
        '-m',
        'ipykernel',
        '-f',
        '{connection_file}'
      ]
    }
  }
};

export function initializeKernelSpecs() {
  // Object.assign(KERNEL_SPECS, kernelSpecs);
  return KERNEL_SPECS;
}

const kernel_spec_filename = join(app.getPath('userData'),'kernels.json');

export function initializeKernelSpecsFromDisk() {
  return readFileObservable(kernel_spec_filename)
    .catch((err) => {
      console.log('could not read specs from disk');
      return KERNEL_SPECS;
    })
    .map((data) => {
      const specs = {};
      Object.assign(specs, JSON.parse(data), KERNEL_SPECS);
      console.log('read specs from disk');
      console.log(JSON.stringify(KERNEL_SPECS, null, 2));
      Object.assign(KERNEL_SPECS, specs);
      return specs;
    });
}

export function initializeKernelSpecsFromSpecs(kernelSpecs) {
  const specs = {};
  Object.assign(specs, kernelSpecs, KERNEL_SPECS);
  if (!_.isEqual(specs, KERNEL_SPECS)) {
    // if the specs changed write to disk
    writeFile(kernel_spec_filename, JSON.stringify(specs), (err) => {
        // unable to write file, just continue
      }
    );
  }
  Object.assign(KERNEL_SPECS, specs);
//   console.log(JSON.stringify(KERNEL_SPECS, null, 2));
  return KERNEL_SPECS;
}

export function addDefaultSpecs(kernelSpecs) {
  const specs = {};
  Object.assign(specs, kernelSpecs, KERNEL_SPECS);
//   console.log('addDefaultSpecs');
//   console.log(JSON.stringify(KERNEL_SPECS, null, 2));
  return specs;
}

export function getKernelSpecs() {
  return KERNEL_SPECS;
}

ipc.on('kernel_specs_request', (event) => {
  event.sender.send('kernel_specs_reply', KERNEL_SPECS);
});
