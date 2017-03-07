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
  importFileEpic,
} from './tellurium';

import {
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic,
} from './config';

export function retryAndEmitError(err, source) {
  return source.startWith({ type: 'ERROR', payload: err, error: true });
}

export const wrapEpic = epic => (...args) =>
  epic(...args).catch(retryAndEmitError);

const epics = [
  commListenEpic,
  importFileEpic,
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
].map(wrapEpic);

export default epics;
