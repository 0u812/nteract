/* @flow */

import { ActionsObservable } from 'redux-observable';

import {
  monocellNotebook,
  fromJS,
  parseNotebook,
} from '../../../packages/commutable';

import type {
  Notebook,
  ImmutableNotebook,
} from '../../../packages/commutable';

import { readFileObservable, readURLObservable } from '../../utils/fs';
import { newKernelByName, newKernel } from '../actions';

const Rx = require('rxjs/Rx');

const path = require('path');

const Observable = Rx.Observable;

export const LOAD = 'LOAD';
export const SET_NOTEBOOK = 'SET_NOTEBOOK';
export const NEW_NOTEBOOK = 'NEW_NOTEBOOK';

export function load(filename: string) {
  return {
    type: LOAD,
    filename,
  };
}

// TODO: Use a kernel spec type
export function newNotebook(kernelSpec: Object, cwd: string) {
  return {
    type: NEW_NOTEBOOK,
    kernelSpec,
    cwd: cwd || process.cwd(),
  };
}

// Expects notebook to be JS Object or Immutable.js
export const notebookLoaded = (filename, notebook: Notebook) => ({
  type: SET_NOTEBOOK,
  filename,
  notebook,
});

/**
  * Creates a new kernel based on the language info in the notebook.
  *
  * @param  {String}  filename  The filename of the notebook being loaded
  * @param  {Immutable<Map>}  notebook  The notebook to extract langauge info from
  *
  * @returns  {ActionObservable}  ActionObservable for a NEW_KERNEL action
  */
export const extractNewKernel = (filename: string, notebook: ImmutableNotebook) => {
  console.log('extractNewKernel');
  const cwd = (filename && !filename.startsWith('http') && !filename.startsWith('https') && path.dirname(path.resolve(filename))) || process.cwd();
  console.log('extractNewKernel cwd', cwd);
  const kernelSpecName = notebook.getIn(
    ['metadata', 'kernelspec', 'name'], notebook.getIn(
      ['metadata', 'language_info', 'name'],
        'python3'));
  return {
    cwd,
    kernelSpecName,
  };
};

/**
  * Converts a notebook from JSON to an Immutable.Map.
  *
  * @param  {String}  filename The filename of the notebook to convert
  * @param  {String}  data  The raw JSON of the notebook
  *
  * @returns  {Object}  The filename and notebook in Immutable.Map form
  */
export const convertRawNotebook = (filename: string, data) => {
  console.log('convertRawNotebook');
  console.log('convertRawNotebook data', data);
  if (data instanceof Buffer || typeof data === 'string') {
    return {
      filename,
      notebook: fromJS(parseNotebook(data)),
    };
  } else {
    // expect an array
    return {
      filename,
      notebook: fromJS(parseNotebook(data[1])),
    };
  }
};

/**
  * Loads a notebook and launches its kernel.
  *
  * @param  {ActionObservable}  A LOAD action with the notebook filename
  */
export const loadEpic = (actions: ActionsObservable) =>
  actions.ofType(LOAD)
    .do((action) => {
      // If there isn't a filename, save-as it instead
      if (!action.filename) {
        throw new Error('load needs a filename');
      }
    })
    // Switch map since we want the last load request to be the lead
    .switchMap(action => {
      const isURL = action.filename.startsWith('http') || action.filename.startsWith('https');
      const filepart = isURL ? action.filename : action.filename.replace('file://','');
      console.log('filepart', filepart);
      return (isURL ? readURLObservable(action.filename) : readFileObservable(filepart))
        .map((response, data) => convertRawNotebook(filepart, response, data))
        .flatMap(({ filename, notebook }) => {
          console.log('before extractNewKernel, filename', filename);
          const { cwd, kernelSpecName } = extractNewKernel(filename, notebook);
          console.log('before notebookLoaded, cwd', cwd);
          console.log('before notebookLoaded, kernelSpecName', kernelSpecName);
          return Observable.of(
            notebookLoaded(filename && !filename.startsWith('http') && !filename.startsWith('https') ? filename : null, notebook),
            // Find kernel based on kernel name
            // NOTE: Conda based kernels and remote kernels will need
            // special handling
            newKernelByName(kernelSpecName, cwd),
          );
        })
        // .catch(err =>
        //   Observable.of({ type: 'ERROR', payload: err, error: true })
        // )
    });

/**
  * Sets a new empty notebook.
  *
  * @param  {ActionObservable}  ActionObservable for NEW_NOTEBOOK action
  */
export const newNotebookEpic = (action$: ActionsObservable) =>
  action$.ofType(NEW_NOTEBOOK)
    .switchMap(action =>
      Observable.of(
        {
          type: 'SET_NOTEBOOK',
          notebook: monocellNotebook,
        },
        newKernel(action.kernelSpec, action.cwd),
      )
    );
