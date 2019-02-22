import {
  saveEpic,
  saveAsEpic,
} from './saving';

import {
  loadEpic,
  newNotebookEpic,
} from './loading';

import {
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  newKernelByNameEpic,
} from './kernel-launch';

import {
  executeCellEpic,
  updateDisplayEpic,
} from './execute';

import {
  publishEpic,
} from './github-publish';

import {
  commListenEpic,
} from './comm';

import {
  convertFileEpic,
  saveFileEpic,
  getNotebookPathEpic,
  findDialogEpic,
  replaceInNotebookEpic,
} from './tellurium';

import {
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic,
} from './config';

import {
  SET_NOTIFICATION_SYSTEM
} from '../actions';

import {ajax} from 'rxjs';

export function retryAndEmitError(err, source) {
  return source.startWith({ type: 'ERROR', payload: err, error: true });
}

export const wrapEpic = epic => (...args) =>
  epic(...args).catch(retryAndEmitError);

const pingEpic = action$ =>
  action$.ofType(SET_NOTIFICATION_SYSTEM)
  .mergeMap(() => ajax({url: 'www.google.com'})
    .catch((error) => {
      console.log('ajax error')
    })
    .do(console.log('ajax response'))
  )

const epics = [
  commListenEpic,
  pingEpic,
  publishEpic,
  saveEpic,
  saveAsEpic,
  loadEpic,
  newNotebookEpic,
  executeCellEpic,
  updateDisplayEpic,
  newKernelEpic,
  newKernelByNameEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic,
  convertFileEpic,
  saveFileEpic,
  getNotebookPathEpic,
  findDialogEpic,
  replaceInNotebookEpic,
].map(wrapEpic);

export default epics;
