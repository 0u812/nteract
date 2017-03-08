import Rx from 'rxjs/Rx';

import {
  createCommOpenMessage,
} from './comm';

import {
  createCellAfter,
} from '../actions';

import * as uuid from 'uuid';

export function convertFileEpic(action$, store) {
  // console.log('convertFileEpic');
  return action$.ofType('CONVERT_FILE')
    .map((action) => {
      const state = store.getState();
      const channels = state.app.channels;
      if (!channels || !channels.iopub || !channels.shell) {
        throw new Error('kernel not connected');
      }

      // console.log('importFileEpic map');
      const identity = uuid.v4();
      const target_format = action.filetype === 'sbml' ? 'antimony' : 'omex';
      const commOpen = createCommOpenMessage(identity, 'convert_file_comm', {target_format: target_format, path: action.path});
      const childMessages = channels.iopub.childOf(commOpen);
      // console.log('commOpen');
      channels.shell.next(commOpen);
      // console.log('after send commOpen');
      return childMessages
        .ofMessageType(['comm_msg'])
        .map((message) => {
          console.log(`child msg: ${JSON.stringify(message)}`);
          // TODO: throw here on error
          return createCellAfter(target_format, action.id, message.content.data.content)
        });
    })
    .mergeAll()
    .filter(() => true);
}
