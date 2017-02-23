import { app, ipcMain as ipc } from 'electron';
import { join } from 'path';

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
  python3: {
    name: 'python3',
    spec: {
      language: 'python',
      display_name: 'Python 3',
      argv: [
        join(app.getPath('userData'),'telocal','python-3.6.0','bin','python3'),
        '-m',
        'ipykernel',
        '-f',
        '{connection_file}'
      ]
    }
  }
};

export default function initializeKernelSpecs(kernelSpecs) {
  // Object.assign(KERNEL_SPECS, kernelSpecs);
  return KERNEL_SPECS;
}

ipc.on('kernel_specs_request', (event) => {
  event.sender.send('kernel_specs_reply', KERNEL_SPECS);
});
