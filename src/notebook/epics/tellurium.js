import Rx from 'rxjs/Rx';

import {
  createCommOpenMessage,
} from './comm';

import {
  createCellAfter,
  createCellBefore,
} from '../actions';

import * as uuid from 'uuid';

export function convertFileEpic(action$, store) {
  return action$.ofType('CONVERT_FILE')
    .map((action) => {
      const state = store.getState();
      const channels = state.app.channels;
      if (!channels || !channels.iopub || !channels.shell) {
        throw new Error('kernel not connected');
      }

      // console.log('importFileEpic map');
      const identity = uuid.v4();

      const target_format = action.filetype === 'sbml' ? 'antimony' :
        action.filetype === 'omex' ? 'omex' :
        () => {throw new Error('Source filetype not recognized')};

      const commOpen = createCommOpenMessage(identity, 'convert_file_comm', {target_format: target_format, path: action.path});
      const childMessages = channels.iopub.childOf(commOpen);

      channels.shell.next(commOpen);
      return childMessages
        .ofMessageType(['comm_msg'])
        .map((message) => {
          if (message.content.data.status === 'error') {
            const notificationSystem = state.app.get('notificationSystem');
            // notificationSystem.addNotification({
            //   title: message.content.data.error,
            //   autoDismiss: 4,
            //   level: 'error',
            // });
            throw new Error('Unable to import archive.')
            // return Rx.Observable.throw(new Error('Unable to import archive.'));
            // return Rx.Observable.of({
            //   type: ERROR_GENERAL,
            //   payload: message.content.data.error,
            //   error: true,
            // });
          }
          if (action.id) {
            // we have a cell id
            if (action.position === 'below') {
              return createCellAfter(target_format, action.id, message.content.data.content)
            } else if (action.position === 'above') {
              return createCellBefore(target_format, action.id, message.content.data.content)
            }
          } else {
            // we don't have a cell id - just append to end
            return createCellAppend(target_format, message.content.data.content)
          }
        });
    })
    .mergeAll();
}

// used for saving non-notebook files
export function saveFileEpic(action$, store) {
  return action$.ofType('SAVE_FILE_FROM_STRING')
    .map((action) => {
      const state = store.getState();
      const channels = state.app.channels;
      if (!channels || !channels.iopub || !channels.shell) {
        throw new Error('kernel not connected');
      }

      const identity = uuid.v4();

      const source_format = action.source_format;
      const target_format = action.target_format;
      const source_str = action.source_str;
      const path = action.path;

      const commOpen = createCommOpenMessage(identity, 'save_file_comm', {
        source_format: source_format,
        target_format: target_format,
        source_str:    source_str,
        path: path});

      const childMessages = channels.iopub.childOf(commOpen);

      channels.shell.next(commOpen);

      return childMessages
        .ofMessageType(['comm_msg'])
        .map((message) => {
          // TODO: throw here on error
          if (message.content.data.status === 'okay') {
            // success
            console.log('done saving');
            const notificationSystem = state.app.get('notificationSystem');
            notificationSystem.addNotification({
              title: `Saved ${message.content.data.file}`,
              autoDismiss: 2,
              level: 'success',
            });
            return Rx.Observable.of({
              type: 'ERROR_SAVING',
              payload: 'hi',
              error: true,
            });
          } else {
            return Rx.Observable.of({
              type: 'ERROR_SAVING',
              payload: message.content.data.error,
              error: true,
            });
          }
        });
    })
    .mergeAll()
    .filter(() => false);
}
