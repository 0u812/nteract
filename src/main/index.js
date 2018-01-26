import { Menu, dialog, app, ipcMain as ipc, BrowserWindow } from 'electron';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

import Rx from 'rxjs/Rx';

import {
  mkdirpObservable,
  readFileObservable,
  writeFileObservable,
  statObservable,
  ncpObservable,
} from '../utils/fs';

import {
  launch,
  launchNewNotebook,
} from './launch';

import { loadFullMenu, setMenu } from './menu';

import prepareEnv from './prepare-env';
import { initializeKernelSpecs, initializeKernelSpecsFromSpecs, getKernelSpecs, addDefaultSpecs, initializeKernelSpecsFromDisk } from './kernel-specs';

import { handleProtocolRequest } from './protocol-handlers';

import {
  writeRecentDocumentsObservable,
  readRecentDocumentsObservable,
  rebuildRecentMenu,
} from './recent.js';

const log = require('electron-log');

const kernelspecs = require('kernelspecs');
const jupyterPaths = require('jupyter-paths');
const path = require('path');

const electron = require('electron');
const protocol = electron.protocol;

const teProtocolPrefix = 'org.analogmachine.tellurium';

const argv = require('yargs')
  .version()
  .usage('Usage: nteract <notebooks> [options]')
  .example('nteract notebook1.ipynb notebook2.ipynb', 'Open notebooks')
  .example('nteract --kernel javascript', 'Launch a kernel')
  .describe('kernel', 'Launch a kernel')
  .default('kernel', 'tepython3')
  .alias('k', 'kernel')
  .alias('v', 'version')
  .alias('h', 'help')
  .describe('verbose', 'Display debug information')
  .help('help')
  .parse(process.argv.slice(1));

log.info('args', argv);

const notebooks = argv._
  .filter(x => /(.ipynb)$/.test(x))
  .filter(x => existsSync(resolve(x)));

ipc.on('new-kernel', (event, k) => {
  launchNewNotebook(k);
});

ipc.on('open-notebook', (event, filename) => {
  launch(resolve(filename));
});

ipc.on('find_kernels', (event, identity) => {
  kernelspecs.findAll().then(
    (specs) => event.sender.send('find_kernels_reply', addDefaultSpecs(specs), identity)
  );
  // delayed version
//   kernelspecs.findAll().then(
//     (specs) => setTimeout( (specs) => event.sender.send('find_kernels_reply', addDefaultSpecs(specs), identity), 1000, specs )
//   );
});

ipc.on('update_kernel_specs', (event, specs) => {
  setMenu( loadFullMenu(initializeKernelSpecsFromSpecs(specs)) );
  rebuildRecentMenu();
});

const electronReady$ = Rx.Observable.fromEvent(app, 'ready');


const fullAppReady$ = Rx.Observable.zip(
  electronReady$,
  prepareEnv
).first();

const jupyterConfigDir = path.join(app.getPath('home'), '.jupyter');
const nteractConfigFilename = path.join(jupyterConfigDir, 'tellurium.json');
// TODO: use app.getPath('userData') instead
const dstTelluriumDataDir = path.join(app.getPath('userData'), 'telocal');
// TODO: Write VERSION.txt to dstTelluriumDataDir
// log.info(dstTelluriumDataDir);

let splashWebContents;
let firstTimeInit = false;

const prepJupyterObservable = prepareEnv
  .mergeMap(() =>
    // Create all the directories we need in parallel
    Rx.Observable.forkJoin(
      // Ensure the runtime Dir is setup for kernels
      mkdirpObservable(jupyterPaths.runtimeDir()),
      // Ensure the config directory is all set up
      mkdirpObservable(jupyterConfigDir)
    )
  )
  // Set up our configuration file
  .mergeMap(() =>
    Rx.Observable.forkJoin(
      readFileObservable(nteractConfigFilename)
        .catch((err) => {
          if (err.code === 'ENOENT') {
            return writeFileObservable(nteractConfigFilename, JSON.stringify({
              theme: 'light',
            }));
          }
          throw err;
        }),
      statObservable(dstTelluriumDataDir)
        .catch((err) => {
          if (err.code === 'ENOENT') {
            const srcTelluriumConfigDir = path.join(require.resolve('ijavascript'), '..', '..', '..', '..', 'telocal');
            // log.info(srcTelluriumConfigDir);
            if (splashWebContents) {
              splashWebContents.send('first-time-init');
            } else {
              firstTimeInit = true;
            }
            return ncpObservable(
              srcTelluriumConfigDir,
              dstTelluriumDataDir)
          }
        })
    )
  );

const kernelSpecsObservable = prepJupyterObservable
  .mergeMap(() => initializeKernelSpecsFromDisk());

console.log('create subject');
const kernelSpecsSubject = new Rx.AsyncSubject();
console.log('subscribe subject');
kernelSpecsObservable.subscribe(kernelSpecsSubject);
console.log('subscribe to subject');
kernelSpecsSubject.subscribe(() => {console.log('callit');});

kernelSpecsObservable.catch((err) => {
  console.log('kernelSpecsObservable catch');
  dialog.showMessageBox({
    type: 'error',
    title: 'No Kernels Installed',
    buttons: [],
    message: 'Failed to configure any kernels. Please reinstall.',
  }, (index) => {
    if (index === 0) {
      app.quit();
    }
  });
});

readRecentDocumentsObservable().subscribe(() => {});

/**
 * Creates an Rx.Subscriber that will create a splash page onNext and close the
 * splash page onComplete.
 * @return {Rx.Subscriber} Splash Window subscriber
 */
export function createSplashSubscriber() {
  let win;

  return Rx.Subscriber.create(() => {
    win = new BrowserWindow({
      width: 565,
      height: 233,
      useContentSize: true,
      title: 'loading',
      frame: false,
      show: false
    });

    // register protocol
    // https://glebbahmutov.com/blog/electron-app-with-custom-protocol/
    protocol.registerHttpProtocol(teProtocolPrefix, (request, callback) => {
      handleProtocolRequest(request.url);
    }, (error) => {
      if (error) console.error('Failed to register protocol');
    });

    const index = join(__dirname, '..', '..', 'static', 'splash.html');
    win.loadURL(`file://${index}`);
    win.once('ready-to-show', () => {
      win.show();
    });

    win.webContents.on('did-finish-load', () => {
      log.info('first time init');
      if (firstTimeInit) {
        win.webContents.send('first-time-init');
      }
    });
  }, null,
  () => {
    // Close the splash page when completed
    if (win) {
      win.close();
    }
  });
}

const appAndKernelSpecsReady = Rx.Observable.zip(fullAppReady$, kernelSpecsSubject);

electronReady$
  // TODO: Take until first window is shown
  .takeUntil(appAndKernelSpecsReady)
  .subscribe(createSplashSubscriber());

function closeAppOnNonDarwin() {
  // On macOS, we want to keep the app and menu bar active
  if (process.platform !== 'darwin') {
    app.quit();
  }
}
const windowAllClosed = Rx.Observable.fromEvent(app, 'window-all-closed');
windowAllClosed
  .skipUntil(appAndKernelSpecsReady)
  .subscribe(closeAppOnNonDarwin);

// when closing, write out recent documents
const willQuit$ = Rx.Observable.fromEvent(
  app,
  'will-quit'
);

willQuit$.take(1)
  .map((event) => {
    event.preventDefault();
    return writeRecentDocumentsObservable();
  })
  .catch((err) => {
    // possible failures include non-writable perms
    // nothing we can do, just give up
    process.exit();
  })
  .subscribe(() => {
    process.exit();
  });

const openFile$ = Rx.Observable.fromEvent(
  app,
  'open-file', (event, filename) => ({ event, filename })
);

function openFileFromEvent({ event, filename }) {
  event.preventDefault();
  launch(resolve(filename));
}


const openUrl$ = Rx.Observable.fromEvent(
  app,
  'open-url', (e, url) => ({ event: e, filename: url })
);

// Since we can't launch until app is ready
// and macOS will send the open-file events early,
// buffer those that come early.
openFile$.merge(openUrl$)
  .buffer(fullAppReady$) // Form an array of open-file events from before app-ready
  .first() // Should only be the first
  .subscribe((buffer) => {
    // Now we can choose whether to open the default notebook
    // based on if arguments went through argv or through open-file events
    if (notebooks.length <= 0 && buffer.length <= 0) {
      log.info('launching an empty notebook by default');
      kernelSpecsSubject.subscribe((specs) => {
        console.log('kernelSpecsSubject1');
        let kernel;

        if (argv.kernel in specs) {
          kernel = argv.kernel;
        } else if ('python2' in specs) {
          kernel = 'python2';
        } else {
          const specList = Object.keys(specs);
          specList.sort();
          kernel = specList[0];
        }

        launchNewNotebook(specs[kernel]);
      }
      );
    } else {
      notebooks
        .forEach((f) => {
          try {
            launch(resolve(f));
          } catch (e) {
            log.error(e);
            console.error(e);
          }
        });
    }
    buffer.forEach(({ event, filename }) => {
      if (filename.startsWith(teProtocolPrefix)) {
        handleProtocolRequest(filename);
      } else {
        openFileFromEvent({ event, filename });
      }
    });
  });

// All open file events after app is ready
openFile$
  .skipUntil(fullAppReady$)
  .subscribe(openFileFromEvent);

openUrl$
  .skipUntil(fullAppReady$)
  .subscribe(({event,filename}) => handleProtocolRequest(filename));

fullAppReady$
  .subscribe(() => {
    kernelSpecsSubject.subscribe((kernelSpecs) => {
      console.log('kernelSpecsSubject2');
      if (Object.keys(kernelSpecs).length !== 0) {
        setMenu( loadFullMenu(kernelSpecs) );
        rebuildRecentMenu();
      } else {
        dialog.showMessageBox({
          type: 'warning',
          title: 'No Kernels Installed',
          buttons: [],
          message: 'No kernels are installed on your system.',
          detail: 'No kernels are installed on your system so you will not be ' +
            'able to execute code cells in any language. You can read about ' +
            'installing kernels at ' +
            'https://ipython.readthedocs.io/en/latest/install/kernel_install.html',
        }, (index) => {
          if (index === 0) {
            app.quit();
          }
        });
      }
    })
  });
